import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { DashboardData } from '@/types/dashboard';
import { DashboardDataContext } from '@/data/DashboardDataContext';
import { loadDashboardData } from '@/data/realData';
export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    loadDashboardData()
      .then((loaded) => {
        if (active) setData(loaded);
      })
      .catch((reason: unknown) => {
        console.error('Dashboard data loading failed:', reason);
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : '원자료를 불러오지 못했습니다.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-100">
        {' '}
        <section className="max-w-xl rounded-2xl border border-red-200 bg-slate-900 p-7 text-center ">
          {' '}
          <h1 className="text-lg font-bold text-white">
            분석 자료를 불러오지 못했습니다
          </h1>{' '}
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {' '}
            제공된 CSV 또는 GeoJSON 파일의 경로와 형식을 확인한 뒤 다시 시도해
            주세요.{' '}
          </p>{' '}
          <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 text-left text-xs text-red-300">
            {error}
          </p>{' '}
          <button
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            {' '}
            다시 불러오기{' '}
          </button>{' '}
        </section>{' '}
      </main>
    );
  }
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        {' '}
        <div className="text-center">
          {' '}
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-[3px] border-red-500 border-t-transparent" />{' '}
          <p className="text-sm text-slate-400">
            제공된 인천 분석 자료를 확인하고 있습니다...
          </p>{' '}
        </div>{' '}
      </main>
    );
  }
  return (
    <DashboardDataContext.Provider value={data}>
      {children}
    </DashboardDataContext.Provider>
  );
}
