'use client'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { Placeholder } from '@tiptap/extensions'
import type * as Y from 'yjs'
import type { WebsocketProvider } from 'y-websocket'
import type { ConnectionStatus, UserInfo } from '@/lib/types'
import { Toolbar } from './Toolbar'
import { CollaborationStatus } from './CollaborationStatus'
import { UserAvatars } from './UserAvatars'
import { CopyLinkButton } from './CopyLinkButton'
import { DocumentTitleInput } from './DocumentTitle'
import UserSettings from './UserSettings'
import { useAwareness } from '@/hooks/useAwareness'

interface EditorProps {
  doc: Y.Doc
  provider: WebsocketProvider
  status: ConnectionStatus
  title: string
  onTitleChange: (title: string) => void
  userInfo: UserInfo
  onUserInfoChange: (info: UserInfo) => void
}

export function Editor({ doc, provider, status, title, onTitleChange, userInfo, onUserInfoChange }: EditorProps) {
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
      // Shows "Start writing…" while the document is empty.
      Placeholder.configure({
        placeholder: 'Start writing…',
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

  // TipTap 3 only re-renders on transaction when a useEditorState selector subscribes.
  // Without this, toolbar active states (bold/italic/lists) freeze at their initial value.
  // Keys match the Toolbar button keys.
  const toolbarActive = useEditorState({
    editor,
    selector: (snapshot) =>
      snapshot.editor
        ? {
            bold: snapshot.editor.isActive('bold'),
            italic: snapshot.editor.isActive('italic'),
            strike: snapshot.editor.isActive('strike'),
            h1: snapshot.editor.isActive('heading', { level: 1 }),
            h2: snapshot.editor.isActive('heading', { level: 2 }),
            bulletList: snapshot.editor.isActive('bulletList'),
            orderedList: snapshot.editor.isActive('orderedList'),
            undo: snapshot.editor.can().undo(),
            redo: snapshot.editor.can().redo(),
          }
        : null,
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2">
        <DocumentTitleInput title={title} onChange={onTitleChange} />
        <div className="flex items-center gap-3">
          <CopyLinkButton />
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
      <Toolbar editor={editor} active={toolbarActive} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
