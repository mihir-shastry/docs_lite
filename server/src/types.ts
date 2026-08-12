import { WebSocket } from "ws";
import * as Y from 'yjs'

export interface DocEntry{
    doc: Y.Doc;
    connections: Set<WebSocket>;
    lastPersisted: number;
}

export interface ConnectionMeta{
    docID: string;
    clientID: number;
}

export const MESSAGE_SYNC = 0;
export const MESSAGE_AWARENESS = 1;
export const MESSAGE_QUERY_AWARENESS = 2;

export const SYNC_STEP1 = 0;   
export const SYNC_STEP2 = 1;   
