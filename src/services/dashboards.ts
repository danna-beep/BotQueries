import BaseService from '@/services/base'
import type {
  IDashboard,
  IDashboardsResponse,
  ILayoutItem,
  IOkResponse,
  ITile,
  ITileCreatePayload,
  ITilePatchPayload,
} from '@/types'

/** Dashboards + chart tiles. Shared: used by the Dashboard view and the Workspace save modal. */
class DashboardService extends BaseService {
  listDashboards = () => this.get<IDashboardsResponse>('/api/dashboards')

  createDashboard = (name: string) => this.post<IDashboard>('/api/dashboards', { name })

  getDashboard = (id: string) => this.get<IDashboard>(`/api/dashboards/${id}`)

  renameDashboard = (id: string, name: string) => this.put<IDashboard>(`/api/dashboards/${id}`, { name })

  deleteDashboard = (id: string) => this.del<IOkResponse>(`/api/dashboards/${id}`)

  addTile = (dashboardId: string, payload: ITileCreatePayload) =>
    this.post<ITile>(`/api/dashboards/${dashboardId}/tiles`, payload)

  updateTile = (dashboardId: string, tileId: string, patch: ITilePatchPayload) =>
    this.put<ITile>(`/api/dashboards/${dashboardId}/tiles/${tileId}`, patch)

  deleteTile = (dashboardId: string, tileId: string) =>
    this.del<IOkResponse>(`/api/dashboards/${dashboardId}/tiles/${tileId}`)

  updateLayout = (dashboardId: string, layouts: ILayoutItem[]) =>
    this.put<IOkResponse>(`/api/dashboards/${dashboardId}/layout`, { layouts })
}

export default new DashboardService()
