/** Collapse whitespace for API city queries (e.g. "new  york" → "new york"). */
export function normalizeCityQuery(city: string): string {
  return city.trim().replace(/\s+/g, " ");
}
