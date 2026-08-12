import { WebSocketServer } from "ws";
import { log } from "./utils";

const PORT = 8080;

const wss = new WebSocketServer({port: PORT});
wss.on('connection', (ws) => {
    log(`New client connected. Total: ${wss.clients.size}`);
    ws.on('message', (data) => {
        log(`Received: ${data.toString()}`);
        ws.send(data);
    });
    ws.on('close', () => {
        log(`Client disconnected. Total: ${wss.clients.size}`);
    });
});

log(`Websocket server listening on port ${PORT}`);

