'use client'
import type { OnlineUser } from '@/lib/types'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

export function UserAvatars({ users }: { users: OnlineUser[] }) {
  const visible = users.slice(0, 5)
  const extra = users.length - visible.length

  if (users.length === 0) return null

  return (
    <div className="flex items-center -space-x-2" title={users.map((u) => u.userInfo.name).join(', ')}>
      {visible.map(({ clientId, userInfo }) => (
        <div
          key={clientId}
          title={userInfo.name}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white"
          style={{ backgroundColor: userInfo.color }}
        >
          {initials(userInfo.name)}
        </div>
      ))}
      {extra > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs font-semibold text-white">
          +{extra}
        </div>
      )}
    </div>
  )
}
