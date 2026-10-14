import { createContext } from 'react';
import type { DashboardData } from '@/types/dashboard';
export const DashboardDataContext = createContext<DashboardData | null>(null);
