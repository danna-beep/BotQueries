import { isNumeric, looksLikeDateColumn } from '@/utils/format'
import type { ChartKind, IQueryResult } from '@/types'

/** Vaas brand palette — violet-led, high contrast on both wine and white. */
export const CHART_COLORS = [
  '#BF65FF', // primary violet
  '#F49F0A', // warning amber
  '#2DD4BF', // teal
  '#60A5FA', // blue
  '#E94560', // error pink
  '#CA7FFF', // light violet
  '#22D3EE', // cyan
  '#FCD34D', // yellow
]

export interface DetectedAxes {
  xKey: string | null
  ySeries: string[]
  xIsDate: boolean
}

/** Pick the best X column (categorical/date) and the numeric series. */
export const detectAxes = (result: IQueryResult | null | undefined): DetectedAxes => {
  if (!result || !result.columns || result.rows.length === 0) {
    return { xKey: null, ySeries: [], xIsDate: false }
  }
  const sample = result.rows[0]
  const numericCols = result.columns.filter((c) => isNumeric(sample[c]))
  const nonNumericCols = result.columns.filter((c) => !isNumeric(sample[c]))

  let x: string | null = null
  let xIsDate = false
  for (const c of result.columns) {
    if (looksLikeDateColumn(c, sample[c])) {
      x = c
      xIsDate = true
      break
    }
  }
  if (!x && nonNumericCols.length) x = nonNumericCols[0]

  if (!x) {
    if (numericCols.length <= 1) {
      return { xKey: null, ySeries: numericCols, xIsDate: false }
    }
    x = numericCols[0]
  }

  const ySeries = numericCols.filter((c) => c !== x)
  return { xKey: x, ySeries, xIsDate }
}

export const defaultChartKind = ({
  rowCount,
  ySeries,
  xIsDate,
}: {
  rowCount: number
  ySeries: string[]
  xIsDate: boolean
}): ChartKind => {
  if (rowCount === 1 && ySeries.length === 1) return 'ring'
  if (xIsDate) return ySeries.length > 1 ? 'line' : 'area'
  if (rowCount <= 8 && ySeries.length === 1) return 'pie'
  return 'bar'
}

export interface ClassifiedColumns {
  numeric: string[]
  nonNumeric: string[]
  all: string[]
}

/** Numeric vs non-numeric columns — used by the "pick label / metrics" selectors. */
export const classifyColumns = (result: IQueryResult | null | undefined): ClassifiedColumns => {
  if (!result?.columns?.length || !result?.rows?.length) {
    return { numeric: [], nonNumeric: [], all: [] }
  }
  const sample = result.rows[0]
  const numeric = result.columns.filter((c) => isNumeric(sample[c]))
  const nonNumeric = result.columns.filter((c) => !isNumeric(sample[c]))
  return { numeric, nonNumeric, all: result.columns }
}
