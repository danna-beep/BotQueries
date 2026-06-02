// src/routes/RoleBasedRoutes.tsx
import { useEffect } from 'react'
import { useRoutes, useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../auth/useAuth'
import boRoutes from './boRoutes'
import userRoutes from './userRoutes'

export const ADMIN_ROLE = 'bo'
const ADMIN_DEFAULT_PATH = '/bo'

const RoleBasedRoutes = () => {
  const { initialized, hasClientRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAdmin = initialized ? hasClientRole(ADMIN_ROLE) : false
  const routes = isAdmin ? boRoutes : userRoutes

  // Always call useRoutes hook - cannot be conditional
  const element = useRoutes(routes)

  // Redirect admin users from "/" to admin default path
  useEffect(() => {
    if (initialized && isAdmin && location.pathname === '/') {
      navigate(ADMIN_DEFAULT_PATH, { replace: true })
    }
  }, [initialized, isAdmin, location.pathname, navigate])

  return <>{element}</>
}

export default RoleBasedRoutes
