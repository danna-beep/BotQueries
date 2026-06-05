import { useMemo } from 'react'
import GridLayout, { WidthProvider, type Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { IDashboard, ILayoutItem } from '@/types'
import TileCard from './TileCard'

const ResponsiveGrid = WidthProvider(GridLayout)

export interface DashboardGridProps {
  dashboard: IDashboard
  onLayoutChange: (layouts: ILayoutItem[]) => void
  onDeleteTile: (tileId: string) => void
}

const DashboardGrid = ({ dashboard, onLayoutChange, onDeleteTile }: DashboardGridProps) => {
  const layout = useMemo<Layout[]>(
    () =>
      dashboard.tiles.map((tile) => ({
        i: tile.id,
        x: tile.layout?.x ?? 0,
        y: tile.layout?.y ?? 0,
        w: tile.layout?.w ?? 6,
        h: tile.layout?.h ?? 5,
        minW: 3,
        minH: 3,
      })),
    [dashboard.tiles]
  )

  const handleLayoutChange = (next: Layout[]) => {
    // Skip the initial broadcast (identical to current persisted layout).
    const unchanged =
      next.length === dashboard.tiles.length &&
      next.every((ly) => {
        const tile = dashboard.tiles.find((tt) => tt.id === ly.i)
        const cur = tile?.layout
        return cur && cur.x === ly.x && cur.y === ly.y && cur.w === ly.w && cur.h === ly.h
      })
    if (unchanged) return
    onLayoutChange(next.map((ly) => ({ i: ly.i, x: ly.x, y: ly.y, w: ly.w, h: ly.h })))
  }

  return (
    <div className='flex-1 overflow-auto bg-background/30 p-4'>
      <ResponsiveGrid
        className='layout'
        layout={layout}
        cols={12}
        rowHeight={56}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        draggableHandle='.drag-handle'
        draggableCancel='.no-drag'
        onLayoutChange={handleLayoutChange}
        compactType='vertical'
      >
        {dashboard.tiles.map((tile) => (
          <div key={tile.id}>
            <TileCard tile={tile} onDelete={onDeleteTile} />
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  )
}

export default DashboardGrid
