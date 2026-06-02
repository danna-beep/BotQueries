# Environment Variables

All environment variables are prefixed with `VITE_` and accessed via `import.meta.env.VITE_*`.

## Variables

| Variable                  | Required | Description                     | Example                                                                      |
| ------------------------- | -------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `VITE_KEYCLOAK_URL`       | Yes      | Keycloak server base URL        | `https://dev-keycloak-trustee-portal.app.getvaas.com/`                       |
| `VITE_KEYCLOAK_REALM`     | Yes      | Keycloak realm name             | `vaas-playground`                                                            |
| `VITE_KEYCLOAK_CLIENT_ID` | Yes      | Keycloak client ID for this app | `fe-vaas-playground`                                                         |
| `VITE_API_BASE_URL`       | Yes      | BFF API base URL                | `/bff` (dev), `https://dev-fo-trustee-portal.app.getvaas.com/bff` (deployed) |
| `VITE_NODE_ENV`           | No       | Environment identifier          | `development`, `production`                                                  |
