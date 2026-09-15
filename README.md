# Docs Lite

A real-time collaborative document editor, Google Docs–style: multiple people can edit the same document at the same time, with live cursors showing who is typing where.

Built with **Yjs CRDTs** for conflict-free concurrent editing, a **TipTap** rich-text editor on the frontend, and a **custom Node.js WebSocket server** on the backend that implements the Yjs sync and awareness protocols.

## Features

- **Real-time collaboration** — edits sync to every connected client instantly, and concurrent edits from different users merge without conflicts (CRDT, no server-side locking).
- **Live cursors & presence** — each user picks a name and color; remote cursors, text selections, and avatar badges update live.
- **Rich text editing** — bold, italic, strikethrough, headings, bullet/ordered lists, and collaborative undo/redo.
- **Persistence** — documents are saved to disk and restored when reopened.
- **Per-document URLs** — creating a doc generates a shareable link (`/doc/<uuid>`); anyone with the link can join.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Editor | TipTap, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-cursor` |
| Sync | Yjs, y-websocket (client), y-prosemirror |
| Backend | Node.js, TypeScript, `ws`, y-protocols (sync + awareness) |
| Storage | LevelDB |

## Architecture

The project is split into two independently deployable apps in this repo:

```
┌─────────────────────┐        WebSocket        ┌──────────────────────┐
│      frontend/      │ ◄─────────────────────► │       server/        │
│   Next.js + TipTap  │   (Yjs sync protocol)  │  Node.js WS server   │
│  Yjs client provider│                        │  per-document state  │
└─────────────────────┘                        └──────────┬───────────┘
                                                          │ debounced saves
                                                   ┌──────▼──────┐
                                                   │   LevelDB   │
                                                   │  (./data)   │
                                                   └─────────────┘
```

- **`frontend/`** — the editor UI. Each document is a Yjs `Y.Doc` connected to the server through a `y-websocket` provider. Awareness data (name, color, cursor position) flows over the same socket.
- **`server/`** — a standalone WebSocket server. It keeps one Yjs document + awareness instance per document ID in memory, implements the sync handshake, relays updates and awareness to all connected clients (excluding the origin), and persists documents to LevelDB.

## How it works

- **Conflict-free merging** — Yjs is a CRDT, so edits made offline or concurrently are merged deterministically instead of clobbering each other. No locks, no "last write wins" — the editor just applies deltas from the shared document.
- **Sync protocol** — on connect, the server sends a sync step-1 message (its state vector); the client replies with the updates it's missing, and vice versa, so both converge on the same document state.
- **Awareness / presence** — cursor positions, selections, and user info are ephemeral presence data (not part of the document). The server relays awareness updates between clients and removes a user's presence when their connection drops, so stale cursors don't linger.
- **Persistence** — document updates are written to LevelDB on a 2-second debounce, and flushed immediately when the last client disconnects. The server also dedupes concurrent first-loads of the same document so a room is never split into two divergent copies.

## Getting started

Requirements: Node.js 20+ and npm.

**1. Start the sync server** (default port `8080`):

```bash
cd server
npm install
npm run dev        # tsx watch — rebuilds on change
```

For a production-style run: `npm run build && npm start`.

**2. Start the frontend** (default port `3000`):

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Create a doc**, then open the same URL in a second browser window and start typing in both — edits, cursors, and presence sync live.

### Environment variables

| App | Variable | Default | Purpose |
|---|---|---|---|
| frontend | `NEXT_PUBLIC_WS_URL` | `ws://localhost:8080` | WebSocket URL of the sync server (use `wss://` in production) |
| server | `WS_PORT` | `8080` | Port the WebSocket server listens on |
| server | `PERSISTENCE_PATH` | `./data` | Where LevelDB stores documents |

A template lives at `frontend/.env.example` — copy it to `.env.local` and set the values you need.

## Project structure

```
├── frontend/                    # Next.js editor app
│   └── src/
│       ├── app/                 # pages: / (create) and /doc/[id] (editor)
│       ├── components/          # toolbar, avatars, connection status, settings
│       ├── hooks/               # useYjsDocument, useAwareness
│       └── lib/                 # constants, types, utils
└── server/                      # Node.js WebSocket sync server
    └── src/
        ├── index.ts             # entry point
        ├── WebSocketServer.ts   # ws wiring
        ├── ConnectionHandler.ts # protocol message handling
        ├── DocumentManager.ts   # per-document state, awareness, persistence
        └── persistence/         # LevelDB adapter
```

## Deployment notes

The two apps are deployed separately, and the frontend must be able to reach the server's public WebSocket URL:

1. Deploy `server/` to any host that runs a long-lived Node.js process and supports WebSockets.
2. Deploy `frontend/` to a static/Next.js host with `NEXT_PUBLIC_WS_URL` set to the server's public URL — **`wss://` in production**, since browsers block insecure WebSockets on HTTPS pages. It's read at build time, so redeploy after changing it.

The server's storage is local to its filesystem — on hosts with ephemeral disks, persisted documents are lost on redeploy.
