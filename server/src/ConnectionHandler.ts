import { WebSocket, RawData } from "ws";
import { IncomingMessage } from "http";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { DocumentManager } from "./DocumentManager";
import { MESSAGE_AWARENESS, MESSAGE_QUERY_AWARENESS, MESSAGE_SYNC } from "./types";
import { log } from "./utils";

export class ConnectionHandler {
  constructor(private documentManager: DocumentManager) {}

  async handleConnection(ws: WebSocket, req: IncomingMessage): Promise<void> {
    const url = new URL(req.url || "/", "http://localhost");
    const documentId = url.pathname.slice(1);
    if (!documentId) {
      ws.close(4000, "Missing document ID");
      return;
    }
    ws.on("message", (data) => {
      void this.handleMessage(ws, toUint8Array(data), documentId);
    });
    ws.on("close", () => this.documentManager.removeConnection(documentId, ws));
    ws.on("error", () => this.documentManager.removeConnection(documentId, ws));


    const doc = await this.documentManager.getDocument(documentId);
    this.documentManager.addConnection(documentId, ws);

    const syncEncoder = encoding.createEncoder();
    encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(syncEncoder, doc);
    ws.send(encoding.toUint8Array(syncEncoder));

    this.sendAwarenessStates(ws, documentId);

    log(`Client connected to document ${documentId}`);
  }

  private async handleMessage(ws: WebSocket, data: Uint8Array, documentId: string): Promise<void> {
    const decoder = decoding.createDecoder(data);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case MESSAGE_SYNC: {
        const doc = await this.documentManager.getDocument(documentId);
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        syncProtocol.readSyncMessage(decoder, encoder, doc, ws);
        if (encoding.length(encoder) > 1) {
          ws.send(encoding.toUint8Array(encoder));
        }
        break;
      }
      case MESSAGE_AWARENESS: {
        const update = decoding.readVarUint8Array(decoder);
        this.documentManager.applyAwarenessUpdate(documentId, update, ws);
        break;
      }
      case MESSAGE_QUERY_AWARENESS: {
        this.sendAwarenessStates(ws, documentId);
        break;
      }
      default:
        log(`Unknown message type ${messageType}`, "warn");
    }
  }

  private sendAwarenessStates(ws: WebSocket, documentId: string): void {
    const awareness = this.documentManager.getAwareness(documentId);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, [...awareness.getStates().keys()])
    );
    ws.send(encoding.toUint8Array(encoder));
  }
}

function toUint8Array(data: RawData): Uint8Array {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (Array.isArray(data)) return Buffer.concat(data);
  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}
