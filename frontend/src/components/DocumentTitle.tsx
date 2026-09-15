'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface DocumentTitleInputProps {
  title: string
  onChange: (title: string) => void
}

/** Inline title editor. Changes are committed on blur or Enter. */
export function DocumentTitleInput({ title, onChange }: DocumentTitleInputProps) {
  const [value, setValue] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  // The title can change from a remote collaborator while this input is focused.
  // Synchronizing that external value is intentional here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(title)
  }, [title])

  function commit() {
    const nextTitle = value.trim()
    setValue(nextTitle)
    if (nextTitle !== title) onChange(nextTitle)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      inputRef.current?.blur()
    }
    if (event.key === 'Escape') {
      setValue(title)
      inputRef.current?.blur()
    }
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      maxLength={80}
      aria-label="Document title"
      className={cn(
        'min-w-0 max-w-[min(28rem,45vw)] rounded px-2 py-1 text-lg font-semibold text-gray-800',
        'border border-transparent bg-transparent outline-none hover:border-gray-200',
        'focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
      )}
      title="Rename document"
    />
  )
}
