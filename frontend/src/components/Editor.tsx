'use client'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import type * as Y from 'yjs'
import type { WebsocketProvider } from 'y-websocket'
import type { ConnectionStatus, UserInfo } from '@/lib/types'
import { Toolbar } from './Toolbar'
import { CollaborationStatus } from './CollaborationStatus'
import { UserAvatars } from './UserAvatars'
import UserSettings from './UserSettings'
import { useAwareness } from '@/hooks/useAwareness'

interface EditorProps {
  documentId: string
  doc: Y.Doc
  provider: WebsocketProvider
  status: ConnectionStatus
  userInfo: UserInfo
  onUserInfoChange: (info: UserInfo) => void
}

export function Editor({ documentId, doc, provider, status, userInfo, onUserInfoChange }: EditorProps) {
  const { onlineUsers } = useAwareness(provider)

  const editor = useEditor({
    extensions: [
      // StarterKit's undoRedo conflicts with Collaboration, which has its own Yjs-based undo/redo.
      StarterKit.configure({
        undoRedo: false,
      }),
      // Bind the editor to the shared Yjs doc.
      Collaboration.configure({ document: doc }),
      // Render remote cursors with name + color.
      CollaborationCursor.configure({
        provider,
        user: { name: userInfo.name, color: userInfo.color },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose-editor',
      },
    },
    // Avoids SSR hydration mismatch.
    immediatelyRender: false,
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2">
        <h1 className="truncate text-lg font-semibold text-gray-800">{documentId}</h1>
        <div className="flex items-center gap-3">
          <UserSettings
            userInfo={userInfo}
            onSave={(info) => {
              // Broadcast identity via awareness, then persist locally.
              editor?.commands.updateUser(info)
              onUserInfoChange(info)
            }}
          />
          <UserAvatars users={onlineUsers} />
          <CollaborationStatus status={status} />
        </div>
      </header>
      <Toolbar editor={editor} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
