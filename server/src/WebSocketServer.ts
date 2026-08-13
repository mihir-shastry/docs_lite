import { WebSocketServer as WSServer } from "ws";
import { IncomingMessage } from "http";
import { DocumentManager } from "./DocumentManager";
import { ConnectionHandler } from "./ConnectionHandler";
import { log } from "./utils";

export class WebSocketServer {
  private wss: WSServer;
  private connectionHandler: ConnectionHandler;

  constructor(port: number, documentManager: DocumentManager) {
    this.connectionHandler = new ConnectionHandler(documentManager);
    this.wss = new WSServer({ port });
    this.wss.on("connection", (ws, req: IncomingMessage) => {
      this.connectionHandler.handleConnection(ws, req).catch((err) => {
        log(`Connection handler error: ${err}`, "error");
        ws.close(1011, "Internal error");
      });
    });
  }

  start(): void {
    log(`WebSocket server listening on port ${(this.wss.options as { port?: number }).port ?? 8080}`);
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      for (const client of this.wss.clients) client.close();
      this.wss.close(() => resolve());
    });
  }
}
