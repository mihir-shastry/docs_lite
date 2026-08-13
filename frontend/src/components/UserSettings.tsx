'use client'
import { useState } from 'react'
import type { UserInfo } from '@/lib/types'
import { USER_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface UserSettingsProps {
  userInfo: UserInfo
  onSave: (info: UserInfo) => void
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

export default function UserSettings({ userInfo, onSave }: UserSettingsProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(userInfo.name)
  const [color, setColor] = useState(userInfo.color)

  function openPanel() {
    setName(userInfo.name)
    setColor(userInfo.color)
    setOpen(true)
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({ name: trimmed, color })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3 hover:bg-gray-50"
        title="Edit name and color"
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: userInfo.color }}
        >
          {initials(userInfo.name)}
        </span>
        <span className="text-sm text-gray-700">{userInfo.name}</span>
      </button>

      {open && (
        <>
          {/* Invisible backdrop: closes the panel when clicking outside */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Display settings</h3>
            <label className="mb-1 block text-xs text-gray-500">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Your name"
              className="mb-3 w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="mb-1 block text-xs text-gray-500">Color</label>
            <div className="mb-4 flex gap-2">
              {USER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-7 w-7 rounded-full',
                    color === c && 'ring-2 ring-offset-2 ring-blue-500'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  )
}