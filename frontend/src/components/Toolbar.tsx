'use client'
import type { Editor } from '@tiptap/react'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  editor: Editor | null
  /** Live active/enabled state, subscribed via useEditorState in the parent. */
  active: Record<string, boolean> | null
}

type ButtonDef = {
  key: string
  label: string
  title: string
  run: (editor: Editor) => void
}

const buttons: ButtonDef[] = [
  {
    key: 'bold',
    label: 'B',
    title: 'Bold',
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    key: 'italic',
    label: 'I',
    title: 'Italic',
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    key: 'strike',
    label: 'S',
    title: 'Strikethrough',
    run: (e) => e.chain().focus().toggleStrike().run(),
  },
  {
    key: 'h1',
    label: 'H1',
    title: 'Heading 1',
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    key: 'h2',
    label: 'H2',
    title: 'Heading 2',
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    key: 'bulletList',
    label: '• List',
    title: 'Bullet list',
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    key: 'orderedList',
    label: '1. List',
    title: 'Ordered list',
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    key: 'undo',
    label: '↩',
    title: 'Undo',
    run: (e) => e.chain().focus().undo().run(),
  },
  {
    key: 'redo',
    label: '↪',
    title: 'Redo',
    run: (e) => e.chain().focus().redo().run(),
  },
]

export function Toolbar({ editor, active }: ToolbarProps) {
  if (!editor || !active) return null

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 px-3 py-2">
      {buttons.map((b) => (
        <button
          key={b.key}
          type="button"
          title={b.title}
          // Keep editor focus when clicking toolbar buttons
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => b.run(editor)}
          className={cn(
            'min-w-8 rounded px-2 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100',
            active[b.key] && 'bg-blue-100 text-blue-700',
            (b.key === 'undo' || b.key === 'redo') && !active[b.key] && 'opacity-40'
          )}
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}
