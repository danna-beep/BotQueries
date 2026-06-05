import { Loader } from '@getvaas/viplay-ui'
import { Typography } from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import { useDashboardFacade } from './hooks'
import { DashboardSelector, DashboardGrid } from './components'

/**
 * Dashboard — build-your-own chart tiles over saved SQL. Selector on top, a
 * draggable/resizable grid of tiles (reusing the shared Chart) below.
 */
const Dashboard = () => {
  const { t } = useTranslation()
  const { data, action, busy } = useDashboardFacade()

  return (
    <section className='flex h-full flex-col overflow-hidden'>
      <DashboardSelector
        dashboards={data.dashboards}
        currentId={data.currentId}
        onSelect={action.setCurrentId}
        onCreate={action.createDashboard}
        onRename={action.renameDashboard}
        onDelete={action.deleteDashboard}
        busy={busy}
      />

      {data.dashboards.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center px-6 text-center'>
          <Typography variant='h3' className='italic'>
            {t('dashboard.empty.first.title')}
          </Typography>
          <p className='mt-3 max-w-md text-sm text-muted-foreground'>{t('dashboard.empty.first.hint')}</p>
        </div>
      ) : !data.current || data.isCurrentLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loader size='lg' />
        </div>
      ) : data.current.tiles.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center px-6 text-center'>
          <Typography variant='h3' className='italic text-foreground/70'>
            {t('dashboard.empty.tiles.title')}
          </Typography>
          <p className='mt-3 max-w-md text-sm text-muted-foreground'>{t('dashboard.empty.tiles.hint')}</p>
        </div>
      ) : (
        <DashboardGrid dashboard={data.current} onLayoutChange={action.updateLayout} onDeleteTile={action.deleteTile} />
      )}
    </section>
  )
}

export default Dashboard
