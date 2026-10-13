import type { RiskGrade } from '@/types/dashboard';
import { RISK_GRADE_INFO } from '@/types/dashboard';

export function riskGradeColor(grade: RiskGrade, opacity = 0.7): string {
  const c = RISK_GRADE_INFO[grade].color;
  return hexToRgba(c, opacity);
}

export function riskGradeFromScore(score: number): RiskGrade {
  if (score >= 70) return 'high';
  if (score >= 50) return 'mediumHigh';
  if (score >= 30) return 'moderate';
  return 'safe';
}

export function vulnerabilityColor(score: number): string {
  const grade = riskGradeFromScore(score);
  return RISK_GRADE_INFO[grade].color;
}

export function vulnerabilityFillColor(score: number, opacity = 0.7): string {
  const grade = riskGradeFromScore(score);
  return riskGradeColor(grade, opacity);
}

export function populationColor(rate: number): string {
  const clamped = Math.max(0, Math.min(50, rate));
  const t = clamped / 50;

  const startR = 219, startG = 234, startB = 254;
  const endR = 30, endG = 64, endB = 175;

  const r = Math.round(startR + (endR - startR) * t);
  const g = Math.round(startG + (endG - startG) * t);
  const b = Math.round(startB + (endB - startB) * t);

  return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

export function facilityColor(count: number, max: number): string {
  const t = max > 0 ? Math.min(1, count / max) : 0;
  const startR = 224, startG = 242, startB = 254;
  const endR = 14, endG = 165, endB = 233;

  const r = Math.round(startR + (endR - startR) * t);
  const g = Math.round(startG + (endG - startG) * t);
  const b = Math.round(startB + (endB - startB) * t);

  return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
