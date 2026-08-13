import { WebSocket } from "ws";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";

export interface DocEntry {
  doc: Y.Doc;
  awareness: Awareness; // presence + cursors, separate from the CRDT
  connections: Set<WebSocket>;
  lastPersisted: number;
}

export interface ConnectionMeta {
  docID: string;
  clientID: number;
}

// First byte of every binary WebSocket message (Yjs protocol)
export const MESSAGE_SYNC = 0; // document data
export const MESSAGE_AWARENESS = 1; // presence / cursors
// 2 = auth message in the real protocol — unused.
export const MESSAGE_QUERY_AWARENESS = 3; // "send me everyone's presence"

// Sync sub-message types (inside a MESSAGE_SYNC payload)
export const SYNC_STEP1 = 0; // "send me your state"
export const SYNC_STEP2 = 1; // a diff/update to apply
