/** Local calendar date as 'YYYY-MM-DD' (not UTC — sugar days follow the phone's clock). */
export function getTodayDateString(): string {
  return toDateString(new Date());
}

export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Monday of the ISO week containing `dateStr`, as 'YYYY-MM-DD' — used to reset the once-a-week grace day. */
export function getWeekStart(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toDateString(d);
}

/** Adds `days` calendar days to a 'YYYY-MM-DD' string. */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}
