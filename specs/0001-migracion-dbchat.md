# Plan de migración — DBChat (SqlApp) → vaas-fe-playground

> Estado: **propuesta / plan**. Migración del **frontend** de `SqlApp/dbchat` a este repo,
> reescribiendo de JSX → TypeScript y re-acomodando a la arquitectura por capas del destino.

## Decisiones tomadas

| Tema | Decisión |
| --- | --- |
| Backend Python (FastAPI) | **Queda como servicio externo.** No se trae al repo. El frontend lo consume vía la capa de servicios. |
| Auth / transporte | **Keycloak** (token Bearer inyectado por `restClient`). Implica trabajo en el backend (ver Prerequisitos). |
| Vistas / rutas | **3 vistas ruteadas**: `Workspace`, `Dashboard`, `NoCode` (react-router, lazy). |

## Alcance

- **SÍ**: reescribir el frontend (`dbchat/frontend/src`, ~5.250 LOC JSX) a TypeScript dentro de la arquitectura del destino (views/hooks/services/components), con `@getvaas/viplay-ui`, React Query, Axios, i18n y Vitest.
- **NO**: migrar el backend Python (~3.500 LOC). Sigue corriendo aparte. Solo se listan los cambios que el backend necesita para integrarse (CORS + validación de token Keycloak).

## Choque arquitectónico (origen → destino)

| Aspecto | Origen (DBChat) | Destino (este repo) | Acción |
| --- | --- | --- | --- |
| Lenguaje | JSX plano | TypeScript estricto | Reescritura + tipado de todos los payloads |
| Datos | `fetch` crudo a `/api`, sin caché | Axios `BaseService`/`restClient` + TanStack React Query | Capa de servicios + hooks de query/mutation |
| Auth | ninguna | Keycloak Bearer (interceptor) | El backend debe validar token (prerequisito) |
| Streaming | `/chat` por SSE (fetch + reader) | no cubierto por axios | Servicio de chat dedicado con fetch + token Keycloak |
| UI | Tailwind crudo + `lucide-react` | `@getvaas/viplay-ui` (obligatorio) | Sustituir primitivos por viplay-ui; iconos a verificar |
| Shell/nav | `TopBar` + tabs por estado + toggle tema | `Layout` + `NavigationMenu` + `UserMenu` + `ThemeProvider` (ya existen) | Reusar shell del destino; descartar TopBar/tabs |
| i18n | strings ES hardcodeados | `t()` + `locales/{en,es}` | Extraer todas las cadenas |
| Charts/grid | `recharts` + `react-grid-layout` | no instalados | Añadir dependencias |
| Markdown | `react-markdown` + `remark-gfm` | no instalado | Añadir dependencias |

## Estructura destino propuesta

```
src/
├── types/
│   └── dbchat.ts                 # Status, Connection, SchemaTable, QueryResult, Dashboard, Tile, Warning, GlossaryEntry, MemoryEntry, ChatEvent
├── utils/
│   └── tailwind.ts               # cn() (clsx + tailwind-merge) — referenciado por las convenciones
├── services/
│   ├── connection.ts             # status, connection, connect, connect/test, disconnect, databases
│   ├── schema.ts                 # schema, context, context/refresh
│   ├── query.ts                  # query, export, downloadUrl
│   └── chat.ts                   # streamChat (SSE) con token Keycloak  ← pieza más delicada
├── providers/  (o components/)
│   └── ConnectionProvider.tsx    # boot: status+connection, gating del modal de conexión (cross-cutting)
├── components/
│   ├── ConnectionModal/          # compartido entre vistas
│   └── Chart/                    # compartido (recharts) — Dashboard + Results
├── routes/
│   └── userRoutes.tsx            # + /workspace /dashboard /nocode (lazy)
└── views/
    ├── Workspace/
    │   ├── Workspace.tsx
    │   ├── hooks/{useWorkspace,useWorkspaceActions,useWorkspaceView,useWorkspaceFacade}.ts
    │   └── components/{SchemaPanel,ResultsPanel,ChatPanel,HistoryPanel}/
    ├── Dashboard/
    │   ├── Dashboard.tsx
    │   ├── hooks/{useDashboard,useDashboardActions}.ts
    │   ├── services/dashboards.ts     # CRUD dashboards + tiles + layout (scoped a la vista)
    │   └── components/{DashboardGrid,SaveToDashboardModal}/
    └── NoCode/
        ├── NoCode.tsx
        ├── hooks/{useNoCode,useNoCodeActions}.ts
        └── components/{NoCodeChat,WarningsView,...}/
```

> Regla de promoción: si algo se usa en ≥2 vistas (p.ej. `Chart`, `ConnectionModal`, servicios de
> connection/schema/query/chat) vive en la capa compartida; si es de una sola vista, queda scoped.

## Mapeo de endpoints → servicios

`lib/api.js` (~30 funciones `fetch`) se reparte en servicios que extienden `BaseService`:

| Servicio | Endpoints |
| --- | --- |
| `connectionService` | `/status`, `/connection`, `/connect`, `/connect/test`, `/connect/databases`, `/databases`, `DELETE /disconnect` |
| `schemaService` | `/schema`, `/context`, `POST /context/refresh` |
| `queryService` | `POST /query`, `POST /export`, `downloadUrl()` |
| `chatService` | `POST /chat` (SSE) — **no** usa `BaseService`; fetch manual + `Authorization: Bearer` desde Keycloak |
| `dashboardService` (scoped) | `/dashboards` CRUD, `/dashboards/:id/tiles` CRUD, `PUT /dashboards/:id/layout` |
| `warningsService` | `/warnings` CRUD |
| `glossaryService` | `/glossary` GET/POST/DELETE |
| `memoryService` | `/memory` CRUD |

## Fases de ejecución

**Fase 0 — Preparación**
- Añadir deps: `recharts`, `react-grid-layout` (+ `@types/react-grid-layout`), `react-markdown`, `remark-gfm`, `clsx`, `tailwind-merge`. Verificar si los iconos de `lucide-react` se cubren con viplay-ui/`@radix-ui/react-icons`; añadir `lucide-react` solo si falta.
- Crear `src/utils/tailwind.ts` con `cn()`.
- Variable de entorno `VITE_API_BASE_URL` apuntando al backend externo.
- **Prerequisitos del backend (fuera de este repo):** habilitar CORS para el origen de la SPA, validar token Keycloak en `/api/*`, y dejar de servir el frontend compilado (pasa a API pura).

**Fase 1 — Tipos + servicios**
- `types/dbchat.ts` con todas las interfaces de payload.
- Servicios por dominio extendiendo `BaseService`.
- `chatService` SSE con token Keycloak (reusar la lógica de refresh del interceptor de `restClient`).

**Fase 2 — Infra compartida / shell**
- `ConnectionProvider` (boot status+connection, gating del `ConnectionModal`) integrado en el `Layout`.
- `ConnectionModal` y `Chart` como componentes compartidos.
- Rutas `/workspace`, `/dashboard`, `/nocode` en `NavigationMenu` + `userRoutes` (lazy). Tema vía `ThemeProvider` existente (se descarta el toggle propio del origen).

**Fase 3 — Vista Workspace**
- `SchemaPanel`, `ResultsPanel`, `ChatPanel`, `HistoryPanel` + hooks (`useWorkspace*`).
- Historial: hoy es estado local en `App.jsx`; mantener en `useWorkspaceView` (o `localStorage` si se quiere persistir).

**Fase 4 — Vista Dashboard**
- Grid drag/resize (`react-grid-layout`), tiles, `SaveToDashboardModal`, charts (`recharts`).
- `dashboardService` scoped + `useDashboard`/`useDashboardActions` (mutations con `invalidateQueries`).

**Fase 5 — Vista NoCode + ajustes**
- `NoCodeChat` (reusa `chatService`).
- `WarningsView`, glossary y memory como sub-secciones de ajustes.

**Fase 6 — Cierre de calidad**
- Extracción i18n (`npm run i18n:scan` / `i18n:update`), en + es.
- Tests Vitest a nivel de vista (patrón `Home.spec.tsx`).
- `npm run lint` + `npm run format` + `npm run build` en verde.

## Riesgos / puntos abiertos

1. **SSE + Keycloak** es lo más frágil: axios no maneja el stream, hay que inyectar el token a mano y manejar refresh/abort. Si el backend no valida Keycloak aún, el chat no funcionará end-to-end.
2. **Backend sin auth hoy** → la decisión "con Keycloak" depende de trabajo en el backend (repo aparte). Mientras tanto se puede probar el frontend con backend auth-less detrás de un proxy.
3. **Iconos**: si viplay-ui no cubre el set de `lucide-react`, habrá que añadir la dep o mapear equivalentes.
4. **`react-grid-layout`** trae su propio CSS y peculiaridades de SSR/medidas; validar que conviva con Tailwind/viplay-ui.
5. **Stores locales del backend** (`~/.dbchat`): dashboards/warnings/glossary/memory son por-máquina; con multiusuario Keycloak habría que decidir si se hacen por-usuario (cambio de backend).
6. El repo destino no tiene `scripts/run-tests.sh` ni `e2e/` aunque `.sdd.json` los referencia; confirmar antes de apoyarse en ellos.
```
