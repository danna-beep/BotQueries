import AxiosMockAdapter from 'axios-mock-adapter'

import restClient from '../services/restClient'

// `onNoMatch: 'passthrough'` lets any unmocked request (e.g. the real DBChat
// `/api/*` backend) reach the network instead of being rejected with a 404.
const instance = new AxiosMockAdapter(restClient, {
  delayResponse: 300,
  onNoMatch: 'passthrough',
})

export default instance

