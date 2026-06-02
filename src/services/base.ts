/* eslint class-methods-use-this: ["error", { "enforceForClassFields": false }] */

import { restClient } from './restClient'

class BaseService {
  request = (url: string, method: string, options = {}, headers = {}) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (restClient as any)[method](`${url}`, options, headers)
  }

  get = async <T = any>(url: string, options = {}, headers = {}) => {
    const response = await this.request(url, 'get', options, headers)
    return response.data as T
  }

  post = async <T = any>(url: string, options = {}, headers = {}) => {
    const response = await this.request(url, 'post', options, headers)
    return response.data as T
  }

  patch = async <T = any>(url: string, options = {}, headers = {}) => {
    const response = await this.request(url, 'patch', options, headers)
    return response.data as T
  }

  put = async <T = any>(url: string, options = {}, headers = {}) => {
    const response = await this.request(url, 'put', options, headers)
    return response.data as T
  }

  del = async <T = any>(url: string, headers = {}) => {
    const response = await this.request(url, 'delete', headers)
    return response.data as T
  }
}

export default BaseService
