export function formatNumber(value: number | null, digits = 0): string {
  if (value === null || !Number.isFinite(value)) return '자료 없음';
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
export function formatPercent(value: number | null, digits = 1): string {
  return value === null || !Number.isFinite(value)
    ? '자료 없음'
    : `${formatNumber(value, digits)}%`;
}
export function formatSignedPercent(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return '자료 없음';
  return `${value > 0 ? '+' : ''}${formatNumber(value, digits)}%`;
}
export function policyTargetLabel(
  unit: string | null,
  admName: string,
  region: string | null,
): string {
  if (unit === '동' || unit?.startsWith('동 단위')) return admName;
  return region?.trim() || '자료 없음';
}
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}
