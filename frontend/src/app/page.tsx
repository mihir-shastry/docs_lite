'use client'
import { useRouter } from "next/navigation"
import { generateId } from "@/lib/utils"

export default function home(){
  const router = useRouter()

  function handleCreate(){
    const id = generateId()
    router.push(`/doc/${id}`)
  }

  return(
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Docs Clone, by Mihir.</h1>
      <p className="mt-4 text-gray-600">Ever seen Google Docs? This is a personal project that handles a simpler form of Docs, a real-time collaborative file editor.</p>
      <button onClick={handleCreate} className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">Create a doc</button>
    </div>
  )
}