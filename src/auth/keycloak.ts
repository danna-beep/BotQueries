// src/auth/keycloak.ts
import Keycloak, { type KeycloakInitOptions } from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
})

let initPromise: Promise<boolean> | null = null
let refreshIntervalId: number | null = null

export function initKeycloak() {
  if (initPromise) return initPromise

  const options: KeycloakInitOptions = {
    onLoad: 'login-required', // 👈 fuerza login al entrar
    pkceMethod: 'S256',
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  }

  initPromise = keycloak.init(options).then((authenticated: boolean) => {
    if (refreshIntervalId == null) {
      refreshIntervalId = window.setInterval(async () => {
        try {
          await keycloak.updateToken(600)
        } catch {
          /* empty */
        }
      }, 20_000)
    }
    return authenticated
  })

  return initPromise
}

export default keycloak
