import { WebSocket } from "ws";
import * as Y from "yjs";
import * as encoding from "lib0/encoding";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { DocEntry, MESSAGE_AWARENESS, MESSAGE_SYNC } from "./types";
import { LevelDBPersistence } from "./persistence/LevelDBPersistence";
import { log } from "./utils";

const PERSIST_DEBOUNCE_MS = 2000;

export class DocumentManager {
  private documents: Map<string, DocEntry> = new Map();
  // Serialize concurrent first loads (two entries = room split).
  private loading: Map<string, Promise<Y.Doc>> = new Map();
  private persistDebounceTimers: Map<string, NodeJS.Timeout> = new Map();
  // Client IDs each connection announced, for presence cleanup on disconnect.
  private connClientIds: Map<WebSocket, Set<number>> = new Map();

  constructor(private persistence: LevelDBPersistence) {}

  getDocument(documentId: string): Promise<Y.Doc> {
    const cached = this.documents.get(documentId);
    if (cached) return Promise.resolve(cached.doc);

    const inFlight = this.loading.get(documentId);
    if (inFlight) return inFlight;

    const promise = this.loadDocument(documentId);
    this.loading.set(documentId, promise);
    return promise;
  }

  private async loadDocument(documentId: string): Promise<Y.Doc> {
    const doc = new Y.Doc();

    // Restore from disk if previously saved.
    const savedState = await this.persistence.load(documentId);
    if (savedState) {
      Y.applyUpdate(doc, savedState);
    }

    const entry: DocEntry = {
      doc,
      awareness: new awarenessProtocol.Awareness(doc),
      connections: new Set(),
      lastPersisted: Date.now(),
    };
    this.documents.set(documentId, entry);
    this.loading.delete(documentId);
    this.wireEvents(documentId, entry);

    log(`Document ${documentId} loaded (${savedState ? "restored from disk" : "new"})`);
    return doc;
  }

  /** Hook events once: every mutation auto-broadcasts (minus origin) + schedules persistence. */
  private wireEvents(documentId: string, entry: DocEntry): void {
    entry.doc.on("update", (update: Uint8Array, origin: unknown) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      this.broadcast(documentId, encoding.toUint8Array(encoder), origin as WebSocket);
      this.schedulePersistence(documentId);
    });

    entry.awareness.on(
      "update",
      (
        changes: { added: number[]; updated: number[]; removed: number[] },
        origin: unknown
      ) => {
        const changedClients = changes.added.concat(changes.updated, changes.removed);
        // Relay only updates from real connections; cleanup of departed clients is server-side.
        if (origin instanceof WebSocket) {
          // Awareness can arrive before addConnection — track it anyway.
          let connClientIds = this.connClientIds.get(origin);
          if (!connClientIds) {
            connClientIds = new Set();
            this.connClientIds.set(origin, connClientIds);
          }
          changedClients.forEach((clientId) => connClientIds.add(clientId));
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
          encoding.writeVarUint8Array(
            encoder,
            awarenessProtocol.encodeAwarenessUpdate(entry.awareness, changedClients)
          );
          this.broadcast(documentId, encoding.toUint8Array(encoder), origin);
        }
      }
    );
  }

  addConnection(documentId: string, ws: WebSocket): void {
    const entry = this.documents.get(documentId);
    if (!entry) return;
    entry.connections.add(ws);
    this.connClientIds.set(ws, new Set());
  }

  removeConnection(documentId: string, ws: WebSocket): void {
    const entry = this.documents.get(documentId);
    if (!entry) return;

    entry.connections.delete(ws);

    // Drop this client's presence so its avatar vanishes (clients never announce departure).
    const clientIds = this.connClientIds.get(ws);
    if (clientIds && clientIds.size > 0) {
      awarenessProtocol.removeAwarenessStates(entry.awareness, [...clientIds], ws);
    }
    this.connClientIds.delete(ws);

    // Last one out: flush pending saves now.
    if (entry.connections.size === 0) {
      const timer = this.persistDebounceTimers.get(documentId);
      if (timer) {
        clearTimeout(timer);
        this.persistDebounceTimers.delete(documentId);
      }
      void this.persistDocument(documentId);
    }
  }

  applyUpdate(documentId: string, update: Uint8Array, origin: WebSocket): void {
    const entry = this.documents.get(documentId);
    if (!entry) return;
    // The doc's update event (wired above) broadcasts + persists.
    Y.applyUpdate(entry.doc, update, origin);
  }

  applyAwarenessUpdate(documentId: string, update: Uint8Array, origin: WebSocket): void {
    const entry = this.documents.get(documentId);
    if (!entry) return;
    awarenessProtocol.applyAwarenessUpdate(entry.awareness, update, origin);
  }

  getDocumentState(documentId: string): Uint8Array {
    const entry = this.documents.get(documentId);
    return entry ? Y.encodeStateAsUpdate(entry.doc) : new Uint8Array();
  }

  getAwareness(documentId: string): awarenessProtocol.Awareness {
    const entry = this.documents.get(documentId);
    if (!entry) throw new Error(`Document ${documentId} not loaded`);
    return entry.awareness;
  }

  broadcast(documentId: string, message: Uint8Array, exclude?: WebSocket): void {
    const entry = this.documents.get(documentId);
    if (!entry) return;

    for (const client of entry.connections) {
      if (client !== exclude && client.readyState === 1 /* OPEN */) {
        client.send(message);
      }
    }
  }

  private schedulePersistence(documentId: string): void {
    const existing = this.persistDebounceTimers.get(documentId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.persistDebounceTimers.delete(documentId);
      void this.persistDocument(documentId);
    }, PERSIST_DEBOUNCE_MS);

    this.persistDebounceTimers.set(documentId, timer);
  }

  private async persistDocument(documentId: string): Promise<void> {
    const entry = this.documents.get(documentId);
    if (!entry) return;

    const state = Y.encodeStateAsUpdate(entry.doc);
    await this.persistence.save(documentId, state);
    entry.lastPersisted = Date.now();
    log(`Document ${documentId} persisted`);
  }
}
