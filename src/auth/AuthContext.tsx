// src/auth/AuthContext.tsx
import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import keycloak, { initKeycloak } from './keycloak'
import type { KeycloakTokenParsed } from 'keycloak-js'

interface IAuthContextType {
  initialized: boolean
  authenticated: boolean
  login: () => void
  logout: () => void
  token?: string
  user?: KeycloakTokenParsed
  hasClientRole: (role: string) => boolean
}

const AuthContext = createContext<IAuthContextType>({
  initialized: false,
  authenticated: false,
  login: () => {},
  logout: () => {},
  token: undefined,
  user: undefined,
  hasClientRole: () => false,
})

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<KeycloakTokenParsed | undefined>(undefined)
  const [token, setToken] = useState<string | undefined>(undefined)

  const didInit = useRef(false)

  useEffect(() => {
    const initKeycloakAsync = async () => {
      try {
        if (!didInit.current) {
          didInit.current = true

          const ok = await initKeycloak()
          console.log('Keycloak initialized:', ok)
          console.log('Keycloak token:', keycloak.token)
          console.log('Keycloak tokenParsed:', keycloak.tokenParsed)

          setAuthenticated(!!ok)
          setToken(keycloak.token ?? undefined)
          setUser(keycloak.tokenParsed as KeycloakTokenParsed | undefined)
          setInitialized(true)

          keycloak.onAuthSuccess = () => {
            console.log('Auth success callback triggered')
            setAuthenticated(true)
            setToken(keycloak.token ?? undefined)
            setUser(keycloak.tokenParsed as KeycloakTokenParsed | undefined)
          }
          keycloak.onAuthLogout = () => {
            console.log('Auth logout callback triggered')
            setAuthenticated(false)
            setToken(undefined)
            setUser(undefined)
          }
          keycloak.onTokenExpired = async () => {
            try {
              await keycloak.updateToken(30)
              setToken(keycloak.token ?? undefined)
              setUser(keycloak.tokenParsed as KeycloakTokenParsed | undefined)
            } catch {
              setAuthenticated(false)
              setToken(undefined)
              setUser(undefined)
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error)
        setInitialized(true)
      }
    }

    initKeycloakAsync()
  }, [])

  const hasClientRole = useCallback((role: string) => {
    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string
    if (clientId) {
      const roles = (keycloak.tokenParsed?.resource_access?.[clientId]?.roles as string[]) ?? []
      return roles.includes(role)
    }
    return false
  }, [])

  const value = useMemo<IAuthContextType>(
    () => ({
      initialized,
      authenticated,
      token,
      user,
      login: () => keycloak.login({ redirectUri: window.location.href }),
      logout: () => keycloak.logout({ redirectUri: window.location.origin }),
      hasClientRole,
    }),
    [user, initialized, authenticated, token, hasClientRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
export default AuthProvider
