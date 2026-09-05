import { ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'

export function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!show) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-3 rounded-full hover:scale-110 transition-all duration-200 animate-fade-in z-40"
      style={{
        backgroundColor: 'var(--primary-color)',
        color: 'var(--text-color-on-primary)',
        boxShadow: 'var(--box-shadow-medium)',
      }}
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  )
}
