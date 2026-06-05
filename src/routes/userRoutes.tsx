// src/routes/userRoutes.tsx
import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Layout } from '../components'

const Workspace = lazy(() => import('@/views/Workspace'))
const Dashboard = lazy(() => import('@/views/Dashboard'))
const NoCode = lazy(() => import('@/views/NoCode'))

const userRoutes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Workspace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'nocode',
        element: <NoCode />,
      },
      {
        path: '*',
        element: <div>Page not found</div>,
      },
    ],
  },
]

export default userRoutes
