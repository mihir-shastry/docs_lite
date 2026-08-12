'use client'
import { useEffect, useState, use } from "react"
import { UserInfo } from "@/lib/types"
import UserNameModal from "@/components/UserNameModal"



export default function docEditor({params}: {params: Promise<{id: string}>}){
    const { id } = use(params)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

    useEffect(() => {
        const saved = localStorage.getItem('docs-lite-user')
        if(saved){
            setUserInfo(JSON.parse(saved))
        }
    }, [])

    function handleSave(info: UserInfo) {
        setUserInfo(info)
        localStorage.setItem('docs-lite-user', JSON.stringify(info))
    }


    return(
        <div className="flex min-h-screen flex-col p-8">
            <h1 className="text-2xl font-bold mb-4">Editing document: {id}</h1>
            <textarea className="flex-1 w-full rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Start typing...">
            </textarea>
            {!userInfo && <UserNameModal onSave={handleSave} />}
        </div>
    )
}