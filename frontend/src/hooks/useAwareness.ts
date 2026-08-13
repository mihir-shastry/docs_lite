'use client'
import { useEffect, useState } from 'react'
import type { WebsocketProvider } from 'y-websocket'
import type { OnlineUser, UserInfo } from '@/lib/types'

function getUser(state: unknown): UserInfo | undefined {
  if (!state || typeof state !== 'object') return undefined
  if (state instanceof Map) return state.get('user') as UserInfo | undefined
  return (state as { user?: UserInfo }).user
}

export function useAwareness(provider: WebsocketProvider | null) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

  useEffect(() => {
    if (!provider) return

    const update = () => {
      const users: OnlineUser[] = []
      provider.awareness.getStates().forEach((state, clientId) => {
        const user = getUser(state)
        if (user && typeof user.name === 'string' && user.name.trim()) {
          users.push({ clientId, userInfo: user })
        }
      })
      setOnlineUsers(users)
    }

    provider.awareness.on('change', update)
    update()
    return () => {
      provider.awareness.off('change', update)
    }
  }, [provider])

  return { onlineUsers }
}
