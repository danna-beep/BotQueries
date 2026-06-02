# Trustee Portal - Frontend

Aplicación frontend vaas-playground construida con React, TypeScript, Vite y viplay-ui.

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

```
src/
├── components/          # Componentes reutilizables
├── hooks/              # Custom hooks
├── i18n/               # Configuración de internacionalización
│   ├── locales/        # Archivos de traducción
│   └── index.ts        # Configuración de i18n
├── auth/               # Autenticación con Keycloak
├── routes/             # Configuración de rutas
├── services/           # Servicios API
├── views/              # Listado de vistas
└── App.tsx             # Componente principal
```

## 🔧 Scripts Disponibles

| Script                 | Descripción                   |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Servidor de desarrollo        |
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
