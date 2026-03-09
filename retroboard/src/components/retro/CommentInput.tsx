import { useState, FormEvent } from 'react'
import { Send } from 'lucide-react'

interface CommentInputProps {
  onSubmit: (text: string) => Promise<void>
  placeholder?: string
}

export function CommentInput({ onSubmit, placeholder = 'Scrivi un commento...' }: CommentInputProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    await onSubmit(text.trim())
    setText('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm
          text-retro-text placeholder:text-slate-400
          transition-all duration-200
          focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10"
      />
      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="w-9 h-9 rounded-full bg-gradient-to-r from-retro-primary to-indigo-500 text-white flex items-center justify-center
          hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        <Send size={14} />
      </button>
    </form>
  )
}
