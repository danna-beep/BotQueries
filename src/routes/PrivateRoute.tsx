// src/routes/PrivateRoute.tsx
import { Outlet } from 'react-router-dom'
import useAuth from '../auth/useAuth'
import { Loader } from '@getvaas/viplay-ui'

const PrivateRoute = () => {
  const { initialized, authenticated, login } = useAuth()

  if (!initialized) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader size='lg' />
      </div>
    )
  }

  if (!authenticated) {
    login()
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader size='lg' />
      </div>
    )
  }

  return <Outlet />
}

export default PrivateRoute
