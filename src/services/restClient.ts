import axios from 'axios'
import type { AxiosError, AxiosResponse } from 'axios'
import keycloak from '../auth/keycloak'

const DEBUG = import.meta.env.VITE_NODE_ENV === 'development'

export const restClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

restClient.interceptors.request.use(async (config) => {
  // Asegura token fresco antes de enviar
  try {
    await keycloak.updateToken(30)
  } catch {
    /* token caducó */
  }
  const token = keycloak.token
  if (token) {
    console.log("🚀 ~ token:", token)
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
    //config.headers.Authorization = `Bearer valid-token`

  }
  return config
})

const responseSuccessHandler = (response: AxiosResponse) => response

const responseErrorHandler = (error: AxiosError) => {
  if (DEBUG) {
    /* eslint-disable */
    if (error.response) {
      console.info(error.response.data)
      console.info(error.response.headers)
    } else if (error.request) {
      console.info(error.request)
    } else {
      console.info('Error', error.message)
    }
    console.info(error.config)
    /* eslint-enable */
  }

  // Handle 401: Always logout
  if (error.response?.status === 401) {
    console.error('Token caducado')
    keycloak.logout()
  }

  // 403, 400, and 500 will be handled by handleHttpError in catch blocks
  // The interceptor just rejects the promise so the error can be caught and handled

  return Promise.reject(error)
}

restClient.interceptors.response.use(
  (response) => {
    if (
      ['post', 'put', 'delete', 'patch'].includes(response.config.method || '') &&
      response.data?.errors?.length &&
      !response.data?.data
    ) {
      const { config, request } = response
      return responseErrorHandler({
        message: 'Fake 200',
        code: '400',
        config,
        request,
        response,
      } as AxiosError)
    }

    return responseSuccessHandler(response)
  },
  (error) => responseErrorHandler(error)
)

export default restClient
