'use client'
import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { WS_URL } from '@/lib/constants'
import type { ConnectionStatus } from '@/lib/types'

const STATUS_MAP: Record<string, ConnectionStatus> = {
  connecting: 'connecting',
  connected: 'connected',
  disconnected: 'disconnected',
}

export function useYjsDocument(documentId: string) {
  const [doc, setDoc] = useState<Y.Doc | null>(null)
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    const ydoc = new Y.Doc()
    // Provider appends /${documentId} — the path is the server's document ID.
    const yprovider = new WebsocketProvider(WS_URL, documentId, ydoc)

    const onStatus = ({ status }: { status: string }) => {
      setStatus(STATUS_MAP[status] ?? 'connecting')
    }
    yprovider.on('status', onStatus)

    setDoc(ydoc)
    setProvider(yprovider)

    return () => {
      yprovider.off('status', onStatus)
      yprovider.destroy()
      ydoc.destroy()
    }
  }, [documentId])

  return { doc, provider, status }
}
