import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}

export default PublicOnlyRoute
