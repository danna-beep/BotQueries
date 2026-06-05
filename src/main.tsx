import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@getvaas/viplay-ui/dist/styles.css'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import './index.css'
import './i18n'
import App from './App.tsx'
import { Toaster, TooltipProvider } from '@getvaas/viplay-ui'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './auth/AuthContext.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './components/ThemeProvider/index.ts'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const bootstrap = async () => {
  // Mock adapter (axios-mock-adapter) is opt-in: only loaded when explicitly
  // enabled, so real `/api/*` calls reach the DBChat backend by default.
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    await import('@/__mocks__')
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <TooltipProvider>
                <App />
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  )
}

bootstrap()
