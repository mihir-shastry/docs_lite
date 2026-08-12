'use client'
import { useState } from "react"
import { UserInfo } from "@/lib/types"
import { USER_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface usernameModalProp{
    onSave: (info: UserInfo) => void
}

export default function UserNameModal({onSave}: usernameModalProp){
    const [name, setName] = useState('')
    const [color, setColor] = useState(USER_COLORS[0])

    return(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="rounded-lg bg-white p-8 shadow-xl">
                <h2 className="text-xl font-bold mb-4">Enter your name.</h2>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full rounded-lg border border-gray-300 p-2 mb-4"></input>
                <div className="flex gap-2 mb-4">
                {USER_COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={cn('h-8 w-8 rounded-full', color === c && 'ring-2 ring-offset-2 ring-blue-500')} style={{ backgroundColor: c }} />
                ))}
                </div>
                <button onClick={() => onSave({name, color})} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white">Join.</button>
            </div>
        </div>
    )
}
