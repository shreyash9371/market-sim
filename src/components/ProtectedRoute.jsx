import MobileGate from './MobileGate'
import { Navigate, Outlet } from 'react-router-dom'
import { isMobileDevice } from '../utils/device'
import Loader from './ui/Loader'
import { useAuthStore } from '../store/auth/useAuthStore'

export default function ProtectedRoute() {
  const { user, loading, approved } = useAuthStore()

  if (loading) {
    return <Loader />
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (!approved) {
    return <Navigate to="/pending" replace />
  }

  if (isMobileDevice()) {
    return <MobileGate />
  }
  return <Outlet />
}