import AxiosMockAdapter from 'axios-mock-adapter'

import restClient from '../services/restClient'

const instance = new AxiosMockAdapter(restClient, { delayResponse: 300 })

export default instance

