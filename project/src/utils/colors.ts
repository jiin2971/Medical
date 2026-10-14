import type { VulnerabilityValue } from '@/types/dashboard';
import { VULNERABILITY_INFO } from '@/types/dashboard';
export function vulnerabilityColor(value: string | null | undefined): string {
  return VULNERABILITY_INFO[classification(value)].color;
}
export function classification(
  value: string | null | undefined,
): VulnerabilityValue {
  if (value === '확정' || value === '경계' || value === '비취약') return value;
  return 'missing';
}
export function populationColor(
  value: number | null,
  minimum: number,
  maximum: number,
): string {
  return numericColor(value, minimum, maximum, [219, 234, 254], [30, 64, 175]);
}
export function metricColor(
  value: number | null,
  minimum: number,
  maximum: number,
): string {
  return numericColor(value, minimum, maximum, [224, 242, 254], [14, 165, 233]);
}
export function numericColor(
  value: number | null,
  minimum: number,
  maximum: number,
  start: [number, number, number],
  end: [number, number, number],
): string {
  if (value === null || !Number.isFinite(value)) return '#CBD5E1';
  const span = maximum - minimum;
  const ratio =
    span > 0 ? Math.max(0, Math.min(1, (value - minimum) / span)) : 0.5;
  const channel = start.map((component, index) =>
    Math.round(component + (end[index] - component) * ratio),
  );
  return `rgb(${channel[0]}, ${channel[1]}, ${channel[2]})`;
}
export function facilitiesCountColor(count: number, maximum: number): string {
  const ratio = maximum > 0 ? Math.max(0, Math.min(1, count / maximum)) : 0;
  return numericColor(ratio, 0, 1, [224, 242, 254], [3, 105, 161]);
}
