# Service Conventions

Patterns for API service classes in `src/services/`.

## Base Service

All services extend `BaseService` which provides typed CRUD methods over the shared Axios instance (`restClient`):

```typescript
class BaseService {
  get<T>(url: string): Promise<T>
  post<T>(url: string, data?: unknown): Promise<T>
  patch<T>(url: string, data?: unknown): Promise<T>
  put<T>(url: string, data?: unknown): Promise<T>
  del<T>(url: string): Promise<T>
}
```

## Creating a Service

```typescript
import { BaseService } from './base'

class OrderService extends BaseService {
  getOrders = (page: number, size: number) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    return this.get<IOrdersResponse>(`/orders?${params.toString()}`)
  }

  createOrder = (data: ICreateOrderPayload) => {
    return this.post<IOrder>('/orders', data)
  }
}

export const orderService = new OrderService()
```

Key rules:
- **One service class per domain area** (e.g., `homeService`, `instructionService`, `manualUploadService`)
- **Methods are arrow functions** assigned as class properties
- **Always type the return** with generics: `this.get<IExpectedType>(...)`
- **Export a singleton instance**, not the class
- **No React imports** — services are pure data access

## REST Client (`restClient.ts`)

The shared Axios instance handles:
- **Request interceptor**: Refreshes Keycloak token if expiring within 30s, injects `Authorization: Bearer <token>`
- **Response interceptor**: Detects fake 200 responses (POST/PUT/PATCH with errors but no data) and converts them to errors; 401 triggers logout

## File Uploads

Use `FormData` for multipart uploads. Axios auto-detects the content type:

```typescript
uploadDocument = (instructionId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return this.post<IUploadResponse>(`/instructions/${instructionId}/documents`, formData)
}
```

## File Downloads

Request blobs and handle content-disposition:

```typescript
downloadReceipts = (ids: string[]) => {
  const params = new URLSearchParams()
  ids.forEach((id) => params.append('ids', id))
  return restClient.get(`/receipts/download?${params.toString()}`, { responseType: 'blob' })
}
```

## View-Specific Services

When a view needs API calls not shared elsewhere, create a service file inside the view:

```
views/Instruction/
└── services/
    └── instruction.ts    # View-specific endpoints
```

This keeps the shared `src/services/` layer focused on widely-used endpoints.

## Do / Don't

| Do | Don't |
|----|-------|
| Extend `BaseService` for new services | Create raw Axios calls outside the service layer |
| Type all responses with generics | Return `any` or untyped promises |
| Use `URLSearchParams` for query strings | Manually concatenate query parameters |
| Export singleton instances | Export classes for manual instantiation |
| Keep services free of React code | Import hooks or components in services |
