import { useAuthStore } from '../store/useAuthStore'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const auth = useAuthStore()

  if (auth.loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--accent-blue)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{
          fontSize: '14px',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-sans)',
        }}>
          Loading...
        </span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (!auth.user) {
    return <Navigate to="/" replace />
  }

  if (!auth.approved) {
    return <Navigate to="/pending" replace />
  }

  return children
}