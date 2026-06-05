import BaseService from '@/services/base'
import type {
  IApiStatus,
  IConnectRequest,
  IConnectResponse,
  IConnectTestResponse,
  IConnectionResponse,
  IDatabasesResponse,
  IOkResponse,
} from '@/types'

/** Connection lifecycle + status against the DBChat backend (`/api/*`). */
class ConnectionService extends BaseService {
  getStatus = () => this.get<IApiStatus>('/api/status')

  getConnection = () => this.get<IConnectionResponse>('/api/connection')

  testConnection = (config: IConnectRequest) =>
    this.post<IConnectTestResponse>('/api/connect/test', config)

  connect = (config: IConnectRequest) => this.post<IConnectResponse>('/api/connect', config)

  disconnect = () => this.del<IOkResponse>('/api/disconnect')

  /** Databases visible to the supplied (not-yet-persisted) credentials. */
  listDatabasesForConfig = (config: IConnectRequest) =>
    this.post<IDatabasesResponse>('/api/connect/databases', config)

  /** Databases visible to the persisted connection. */
  listDatabasesStored = () => this.get<IDatabasesResponse>('/api/databases')
}

export default new ConnectionService()
