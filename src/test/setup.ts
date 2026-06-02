import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock keycloak-js to prevent unhandled rejections when restClient tries to
// call keycloak.updateToken / keycloak.logout in the test environment.
vi.mock('../auth/keycloak', () => ({
  default: {
    token: undefined,
    updateToken: vi.fn().mockResolvedValue(false),
    logout: vi.fn(),
    login: vi.fn(),
  },
  initKeycloak: vi.fn().mockResolvedValue(true),
}))

// Mock restClient to prevent real HTTP requests from hitting localhost during tests.
// Individual tests mock service methods directly (vi.spyOn), so this only catches
// unmocked background requests (e.g. /trusts/related, /receipts/*/preview-url).
const mockAxiosInstance = {
  get: vi.fn().mockResolvedValue({ data: {} }),
  post: vi.fn().mockResolvedValue({ data: {} }),
  put: vi.fn().mockResolvedValue({ data: {} }),
  patch: vi.fn().mockResolvedValue({ data: {} }),
  delete: vi.fn().mockResolvedValue({ data: {} }),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}
vi.mock('../services/restClient', () => ({
  default: mockAxiosInstance,
  restClient: mockAxiosInstance,
}))

// jsdom does not provide ResizeObserver (required by Radix UI components e.g. Dialog, RadioGroup)
class ResizeObserverMock {
  observe = () => undefined
  unobserve = () => undefined
  disconnect = () => undefined
}
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
}

// jsdom does not provide IntersectionObserver (used by viplay-ui/Radix and other UI libs)
class IntersectionObserverMock {
  observe = () => undefined
  unobserve = () => undefined
  disconnect = () => undefined
  root = null
  rootMargin = ''
  thresholds = []
}
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver
}
