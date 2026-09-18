export interface DateBounds {
  startDate: Date | null;
  endDate: Date | null;
}

export const resolveDateBounds = (query: {
  period?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
}): DateBounds => {
  const now = new Date();

  // 1. Explicit month parameter (YYYY-MM)
  if (query.month) {
    const [yearStr, monthStr] = query.month.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      return { startDate, endDate };
    }
  }

  // 2. Explicit startDate and endDate provided
  if (query.startDate && query.endDate) {
    let start = new Date(query.startDate);
    let end = new Date(query.endDate);

    // If passed as YYYY-MM-DD, set boundary hours
    if (typeof query.startDate === 'string' && query.startDate.length === 10) {
      const [sy, sm, sd] = query.startDate.split('-').map(Number);
      start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
    }
    if (typeof query.endDate === 'string' && query.endDate.length === 10) {
      const [ey, em, ed] = query.endDate.split('-').map(Number);
      end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
    }

    // Auto-swap if start > end
    if (start.getTime() > end.getTime()) {
      const temp = start;
      start = end;
      end = temp;
    }

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return { startDate: start, endDate: end };
    }
  }

  const period = query.period || 'Monthly';

  if (period === 'All') {
    return { startDate: null, endDate: null };
  }

  if (period === 'Daily' || period === 'Today') {
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startDate, endDate };
  }

  if (period === 'Weekly' || period === 'Last7Days') {
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startDate, endDate };
  }

  if (period === 'Monthly' || period === 'ThisMonth') {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  if (period === 'PreviousMonth' || period === 'LastMonth') {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  if (period === 'PrevMonthToDate' || period === 'PreviousMonthToToday') {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startDate, endDate };
  }

  if (period === 'Yearly' || period === 'ThisYear') {
    const startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  // Default fallback: This Month
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};
