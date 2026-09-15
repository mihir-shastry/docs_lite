import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import * as Y from 'yjs'
import type { WebsocketProvider } from 'y-websocket'

export const DEFAULT_DOCUMENT_TITLE = 'Untitled document'
export const MAX_DOCUMENT_TITLE_LENGTH = 80

/** Reads and writes the shared title stored in the Yjs document metadata map. */
export function useDocumentTitle(
  doc: Y.Doc | null,
  provider: WebsocketProvider | null
) {
  const metadata = useMemo(() => doc?.getMap<string>('metadata') ?? null, [doc])

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!metadata) return () => {}
      metadata.observe(onStoreChange)
      return () => metadata.unobserve(onStoreChange)
    },
    [metadata]
  )

  const getSnapshot = useCallback(
    () => metadata?.get('title') ?? '',
    [metadata]
  )

  const title = useSyncExternalStore(subscribe, getSnapshot, () => '')

  // Do not create a title until the initial server sync has completed. This avoids
  // a new client racing an existing title and overwriting it before it is received.
  useEffect(() => {
    if (!doc || !provider || !metadata) return

    const initializeTitle = (synced: boolean) => {
      if (synced && !metadata.has('title')) {
        doc.transact(() => {
          metadata.set('title', DEFAULT_DOCUMENT_TITLE)
        }, 'title-initialization')
      }
    }

    provider.on('sync', initializeTitle)
    if (provider.synced) initializeTitle(true)

    return () => {
      provider.off('sync', initializeTitle)
    }
  }, [doc, metadata, provider])

  const setTitle = useCallback(
    (nextTitle: string) => {
      if (!metadata) return
      metadata.set(
        'title',
        nextTitle.slice(0, MAX_DOCUMENT_TITLE_LENGTH)
      )
    },
    [metadata]
  )

  return {
    title,
    displayTitle: title.trim() || DEFAULT_DOCUMENT_TITLE,
    setTitle,
  }
}
