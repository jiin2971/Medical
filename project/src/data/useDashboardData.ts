import { useContext } from 'react';
import { DashboardDataContext } from '@/data/DashboardDataContext';
export function useDashboardData() {
  const data = useContext(DashboardDataContext);
  if (!data)
    throw new Error(
      'useDashboardData는 DashboardDataProvider 안에서 사용해야 합니다.',
    );
  return data;
}
