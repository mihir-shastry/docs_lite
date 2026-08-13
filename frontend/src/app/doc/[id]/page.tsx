'use client'
import { use, useEffect, useState } from 'react'
import type { UserInfo } from '@/lib/types'
import UserNameModal from '@/components/UserNameModal'
import { Editor } from '@/components/Editor'
import { useYjsDocument } from '@/hooks/useYjsDocument'

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
      <Editor documentId={id} doc={doc} provider={provider} status={status} userInfo={userInfo} onUserInfoChange={handleSave} />
    </div>
  )
}
