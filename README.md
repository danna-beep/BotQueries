# Trustee Portal - Frontend

Monorepo de vaas-playground: frontend (React, TypeScript, Vite, viplay-ui) en la raíz y backend (FastAPI/DBChat) en `backend/`.

## 🚀 Características

- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **Radix-ui** con componentes personalizados de @getvaas/viplay-ui
- **Internacionalización** (i18n) con react-i18next
- **Autenticación** con Keycloak
- **Routing** con React Router v6
- **Testing** con Vitest y React Testing Library
- **Linting** con ESLint y Prettier
- **Pre-commit hooks** con Husky

## 📋 Prerrequisitos

- **Node.js** 22.x
- **npm** 9.x+
- **Python** 3.11+ (para el backend en `backend/`)

## 🛠️ Instalación y Desarrollo

### 1. Configurar autenticación para @getvaas/viplay-ui

El proyecto usa `@getvaas/viplay-ui` que está en un registry privado de GitHub. Necesitas configurar un token de autenticación:

```bash
# Configurar el token de GitHub (reemplaza YOUR_GITHUB_TOKEN)
export NODE_AUTH_TOKEN=YOUR_GITHUB_TOKEN

# O crear un archivo .env con el token
echo "NODE_AUTH_TOKEN=YOUR_GITHUB_TOKEN" >> .env
```

**Nota**: El token debe tener permisos de `read:packages` para acceder al registry privado.

### 2. Instalar dependencias

```bash
npm install
```



### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🐍 Backend (monorepo)

El backend (FastAPI) vive en `./backend` dentro de este mismo repo. El frontend
llama a `/api/*`, que en desarrollo Vite proxya a `http://127.0.0.1:8000`
(ver `vite.config.ts`, override con `DBCHAT_BACKEND_URL`).

### 1. Configurar el backend (una vez)

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
cp backend/.env.example backend/.env   # luego edita backend/.env
```

`backend/.env` necesita al menos `ANTHROPIC_API_KEY`. La conexión a MySQL se
toma de `backend/.env` (`MYSQL_*`, vía `DbConfig.from_env()`) o se configura en
la UI ("Configurar accesos"), que la persiste en `~/.dbchat/config.json`.

> Para que el backend alcance la base de datos (p. ej. `dbro.app.getvaas.com`)
> puede que la máquina necesite VPN.

### 2. Correr backend + frontend juntos

```bash
npm run dev:all      # uvicorn :8000 + Vite :5173 (un solo comando)
```

O por separado en dos terminales:

```bash
npm run dev:api      # solo backend (uvicorn :8000)
npm run dev          # solo frontend (Vite :5173)
```

### 3. (Opcional) un solo proceso

Compila el front (`npm run build`) y deja que FastAPI sirva el SPA + la API en
el mismo puerto apuntando `DBCHAT_STATIC_DIR` al directorio de build:

```bash
npm run build
DBCHAT_STATIC_DIR="$PWD/build" backend/.venv/bin/uvicorn app.main:app --app-dir backend --port 8000
# → http://localhost:8000 sirve SPA + /api (single-origin)
```

## 🔐 Autenticación

El proyecto usa **Keycloak** para autenticación:

- **Configuración**: `src/auth/keycloak.ts`
- **Context**: `src/auth/AuthContext.tsx`
- **Hook**: `src/auth/useAuth.ts`
- **Rutas protegidas**: `src/routes/PrivateRoute.tsx`
- **Roles**: `src/routes/RequireRole.tsx`

## 🌐 Internacionalización (i18n)

### Comandos disponibles:

```bash
# Extraer claves de traducción del código
npm run i18n:scan

# Formatear código
npm run format

# Verificar formato
npm run format:check
```

### Agregar nuevas traducciones:

1. Usar `t('clave.traduccion')` en tu código
2. Ejecutar `npm run i18n:scan` para extraer claves
3. Editar archivos en `src/i18n/locales/`
4. Las traducciones se cargan automáticamente

### Idiomas soportados:

- **Inglés** (en) - Idioma por defecto
- **Español** (es)

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar linter
npm run lint

# Ejecutar linter con auto-fix
npm run lint:fix
```


## 📁 Estructura del Proyecto

Monorepo: frontend en la raíz + backend FastAPI en `backend/`.

```
.
├── src/                # Frontend (React + Vite)
│   ├── components/     # Componentes reutilizables
│   ├── hooks/          # Custom hooks
│   ├── i18n/           # Internacionalización (locales/ + config)
│   ├── auth/           # Autenticación con Keycloak
│   ├── routes/         # Configuración de rutas
│   ├── services/       # Servicios API (cliente /api)
│   ├── views/          # Listado de vistas
│   └── App.tsx         # Componente principal
├── backend/            # Backend FastAPI (DBChat)
│   ├── app/            # main.py, agent.py, context/*.md, …
│   ├── requirements.txt
│   └── .env.example
├── scripts/dev.sh      # Levanta backend + frontend juntos
└── vite.config.ts      # Proxy /api → 127.0.0.1:8000 (dev)
```

## 🔧 Scripts Disponibles

| Script                 | Descripción                   |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Servidor de desarrollo (solo frontend) |
| `npm run dev:all`      | Backend (uvicorn :8000) + frontend (Vite :5173) |
| `npm run dev:api`      | Solo backend (uvicorn :8000)  |
| `npm run build`        | Build de producción           |
| `npm run preview`      | Preview del build             |
| `npm run lint`         | Ejecutar linter               |
| `npm run lint:fix`     | Linter con auto-fix           |
| `npm run format`       | Formatear código con Prettier |
| `npm run format:check` | Verificar formato             |
| `npm run test`         | Ejecutar tests                |
| `npm run test:watch`   | Tests en modo watch           |
| `npm run i18n:scan`    | Extraer claves de traducción  |

```bash
npm run build
```

Los archivos se generan en `./build/`
