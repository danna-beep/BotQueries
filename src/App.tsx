// src/App.tsx
import { useRoutes } from 'react-router-dom'
import { Suspense } from 'react'
import { Loader } from '@getvaas/viplay-ui'
import routes from './routes/routes'

const App = () => {
  const element = useRoutes(routes)

  return (
    <Suspense
      fallback={
        <div className='flex justify-center items-center min-h-screen'>
          <Loader size='lg' />
        </div>
      }
    >
      {element}
    </Suspense>
  )
}

export default App
