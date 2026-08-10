export function formatGrams(grams: number): string {
  return `${Math.round(grams)}g`;
}

export function formatPoints(points: number): string {
  return Math.round(points).toLocaleString();
}
