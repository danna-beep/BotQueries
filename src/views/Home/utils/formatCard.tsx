import dayjs from 'dayjs'

/**
 * Determines the color variant for a deadline badge based on the deadline date
 * @param dateDeadline - ISO date string of the deadline
 * @returns 'success' | 'destructive' | 'info' | 'warning'
 */
export const getDeadlineColor = (
  dateDeadline: string
): 'success' | 'destructive' | 'info' | 'warning' => {
  const deadline = dayjs(dateDeadline).startOf('day')
  const today = dayjs().startOf('day')

  // Calculate difference in days
  const diffDays = deadline.diff(today, 'day')

  // Logic:
  // - Past deadline (negative days) -> destructive (red)
  // - Today (0 days) -> warning (yellow/orange)
  // - Tomorrow or next 3 days (1-3 days) -> info (blue)
  // - More than 3 days in the future -> success (green)

  if (diffDays < 0) {
    return 'destructive' // Past deadline
  } else if (diffDays === 0) {
    return 'warning' // Today
  } else if (diffDays <= 3) {
    return 'info' // Next 1-3 days
  } else {
    return 'success' // More than 3 days away
  }
}
