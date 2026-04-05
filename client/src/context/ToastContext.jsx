import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast stack — renders at bottom-center above mobile nav */}
      <div style={{
        position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
        alignItems: 'center', pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: 'var(--ink)', color: '#fff',
              fontSize: 13, fontWeight: 500, letterSpacing: '.02em',
              padding: '12px 24px', borderRadius: 2,
              whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,.18)',
              animation: 'toastIn .25s cubic-bezier(.25,.1,.25,1) forwards',
              fontFamily: "'Jost', sans-serif",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
