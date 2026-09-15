'use client'
import { use, useEffect, useState } from 'react'
import type { UserInfo } from '@/lib/types'
import UserNameModal from '@/components/UserNameModal'
import { Editor } from '@/components/Editor'
import { useYjsDocument } from '@/hooks/useYjsDocument'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRecentDocuments } from '@/hooks/useRecentDocuments'

export default function DocumentEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  useEffect(() => {
    try{
        const stored = localStorage.getItem('docs-lite-user');
        if(stored){
            setUserInfo(JSON.parse(stored) as UserInfo);
        }
    } catch {

    }
  }, [])

  const { doc, provider, status } = useYjsDocument(id)
  const { displayTitle, setTitle } = useDocumentTitle(doc, provider)
  const { rememberDocument } = useRecentDocuments()

  // Keep the browser's recent list useful even when a title changes in another tab.
  useEffect(() => {
    if (doc && provider?.synced) rememberDocument(id, displayTitle)
  }, [displayTitle, doc, id, provider, rememberDocument])

  // Live tab title uses the shared title.
  useEffect(() => {
    document.title = `${displayTitle} — Docs Lite`
  }, [displayTitle])

  function handleSave(info: UserInfo) {
    setUserInfo(info)
    localStorage.setItem('docs-lite-user', JSON.stringify(info))
  }

  if (!userInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <UserNameModal onSave={handleSave} />
      </div>
    )
  }

  if (!doc || !provider) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Connecting…
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col p-4">
      <Editor doc={doc} provider={provider} status={status} title={displayTitle} onTitleChange={setTitle} userInfo={userInfo} onUserInfoChange={handleSave} />
    </div>
  )
}
