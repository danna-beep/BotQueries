// src/routes/userRoutes.tsx
import type { RouteObject } from 'react-router-dom'
import { Layout } from '../components'
import { Home } from '../views'

const userRoutes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'other/:id',
        element: <div>Add other route here and use the id with useParams</div>,
      },
      {
        path: '*',
        element: <div>Page not found</div>,
      },
    ],
  },
]

export default userRoutes
