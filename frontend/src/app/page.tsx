'use client'
import { useRouter } from 'next/navigation'
import { generateId } from '@/lib/utils'
import { formatRecentDate, useRecentDocuments } from '@/hooks/useRecentDocuments'

export default function Home() {
  const router = useRouter()
  const { documents } = useRecentDocuments()

  function handleCreate() {
    router.push(`/doc/${generateId()}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-16 text-gray-900">
      <section className="w-full max-w-2xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Docs Lite</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Write together, anywhere.</h1>
          <p className="mt-4 max-w-xl text-gray-600">
            A lightweight real-time collaborative editor with live cursors and conflict-free syncing.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create a doc
          </button>
        </div>

        {documents.length > 0 && (
          <section className="mt-8" aria-labelledby="recent-documents-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="recent-documents-heading" className="text-sm font-semibold text-gray-700">
                Recent documents
              </h2>
              <span className="text-xs text-gray-400">Only stored in this browser</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {documents.map((document) => (
                <button
                  type="button"
                  key={document.id}
                  onClick={() => router.push(`/doc/${document.id}`)}
                  className="flex w-full items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-gray-800">{document.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-400">{document.id}</span>
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">{formatRecentDate(document.updatedAt)}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
