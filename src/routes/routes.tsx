// src/routes/routes.tsx
import type { RouteObject } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import RoleBasedRoutes from './RoleBasedRoutes'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        // index: true matches only the exact parent path ("/")
        index: true,
        element: <RoleBasedRoutes />,
      },
      {
        path: '*',
        element: <RoleBasedRoutes />,
      },
    ],
  },
]

export default routes
