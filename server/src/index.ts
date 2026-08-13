import { LevelDBPersistence } from "./persistence/LevelDBPersistence";
import { DocumentManager } from "./DocumentManager";
import { WebSocketServer } from "./WebSocketServer";
import { log } from "./utils";

const PORT = Number(process.env.PORT) || 8080;
const PERSISTENCE_PATH = process.env.PERSISTENCE_PATH || "./data";

async function main(): Promise<void> {
  const persistence = new LevelDBPersistence(PERSISTENCE_PATH);
  const documentManager = new DocumentManager(persistence);
  const server = new WebSocketServer(PORT, documentManager);
  server.start();

  const shutdown = async (): Promise<void> => {
    log("Shutting down...");
    await server.close();
    await persistence.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  log(`Fatal error: ${err}`, "error");
  process.exit(1);
});
