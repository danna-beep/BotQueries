// src/routes/boRoutes.tsx
import type { RouteObject } from 'react-router-dom'
import { Layout } from '../components'

const boRoutes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: <div>Hello World</div>,
      },
      {
        path: 'bo',
        element: (
          <div>
            This is the admin home. If applies, you can replace this with the actual admin home.
          </div>
        ),
      },
      {
        path: '*',
        element: <div>Page not found</div>,
      },
    ],
  },
]

export default boRoutes
