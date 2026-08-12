'use client'
import { useEffect, useState, use } from "react"
import { UserInfo } from "@/lib/types"
import UserNameModal from "@/components/UserNameModal"
import { WS_URL } from "@/lib/constants"
import { CollaborationStatus } from "@/components/CollaborationStatus"
import { ConnectionStatus } from "@/lib/types"



export default function docEditor({params}: {params: Promise<{id: string}>}){
    const { id } = use(params)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [status, setStatus] = useState<ConnectionStatus>('connecting');

    useEffect(() => {
        const ws = new WebSocket(WS_URL)
        ws.onopen = () => {
            setStatus('connected');
            ws.send('joined');
        }
        ws.onclose = () => {
            setStatus('disconnected');
        }
        ws.onerror = () => {
            setStatus('error');
        }
        ws.onmessage = (e) => {
            console.log('Received:', e.data);
        }
        return () => {
            ws.close();
        }
    }, [])

    function handleSave(info: UserInfo) {
        setUserInfo(info)
        localStorage.setItem('docs-lite-user', JSON.stringify(info))
    }


    return(
        <div className="flex min-h-screen flex-col p-8">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Editing document: {id}</h1><CollaborationStatus status={status}/>
            </div>
            <textarea className="flex-1 w-full rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Start typing...">
            </textarea>
            {!userInfo && <UserNameModal onSave={handleSave} />}
        </div>
    )
}