'use client'
import { useEffect, useRef, useState } from 'react'

/** Copies the current page URL. Falls back to a prompt() when the async Clipboard API is unavailable (insecure contexts). */
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  function copyViaExecCommand(url: string): boolean {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(textarea)
    return ok
  }

  async function handleCopy() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API needs a secure context; http://localhost works but plain http://<lan-ip> doesn't.
      if (!copyViaExecCommand(url)) {
        window.prompt('Copy this document link:', url)
      }
    }
  }

  function handleClick() {
    setCopied(true)
    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), 1500)
    void handleCopy()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
      title="Copy shareable link"
    >
      {copied ? '✓ Copied' : '🔗 Copy link'}
    </button>
  )
}
