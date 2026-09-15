import { useCallback, useSyncExternalStore } from 'react'
import type { RecentDocument } from '@/lib/types'

const STORAGE_KEY = 'docs-lite-recent-docs'
const CHANGE_EVENT = 'docs-lite-recent-docs-change'
const MAX_RECENT_DOCUMENTS = 8

let cachedStorageValue: string | null = null
let cachedRecentDocuments: RecentDocument[] = []

function readRecentDocuments(): RecentDocument[] {
  if (typeof window === 'undefined') return []

  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === cachedStorageValue) return cachedRecentDocuments
  cachedStorageValue = raw

  try {
    const value: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(value)) {
      cachedRecentDocuments = []
      return cachedRecentDocuments
    }

    cachedRecentDocuments = value.filter(
      (item): item is RecentDocument =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.updatedAt === 'number'
    )
    return cachedRecentDocuments
  } catch {
    cachedRecentDocuments = []
    return cachedRecentDocuments
  }
}

function notifyRecentDocumentsChanged() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(CHANGE_EVENT, onStoreChange)
  }
}

/** Keeps a small, browser-local list of documents the user has opened. */
export function useRecentDocuments() {
  const documents = useSyncExternalStore(
    subscribe,
    readRecentDocuments,
    () => []
  )

  const rememberDocument = useCallback((id: string, title: string) => {
    const existing = readRecentDocuments().filter((document) => document.id !== id)
    const next: RecentDocument[] = [
      {
        id,
        title: title.trim() || 'Untitled document',
        updatedAt: Date.now(),
      },
      ...existing,
    ].slice(0, MAX_RECENT_DOCUMENTS)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      notifyRecentDocumentsChanged()
    } catch {
      // Recent documents are only a convenience; private browsing may block storage.
    }
  }, [])

  return { documents, rememberDocument }
}

export function formatRecentDate(timestamp: number): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date)
}
