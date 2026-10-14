import { useState } from 'react';
import {
  Building2,
  HeartPulse,
  LayoutDashboard,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DashboardDataProvider } from '@/data/DashboardDataProvider';
import { useDashboardData } from '@/data/useDashboardData';
import { MainDashboard } from '@/components/tabs/MainDashboard';
import { ElderlyPopulationMap } from '@/components/tabs/ElderlyPopulationMap';
import { MedicalFacilitiesMap } from '@/components/tabs/MedicalFacilitiesMap';
import { ClusterAnalysis } from '@/components/tabs/ClusterAnalysis';
type TabId = 'dashboard' | 'population' | 'facilities' | 'clusters';
const TABS = [
  { id: 'dashboard' as const, label: '종합 현황', icon: LayoutDashboard },
  { id: 'population' as const, label: '고령인구 변화', icon: Users },
  { id: 'facilities' as const, label: '의료기관·접근성', icon: Building2 },
  { id: 'clusters' as const, label: '공간군집·정책', icon: TrendingUp },
];
function DashboardShell() {
  const { validation } = useDashboardData();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {' '}
      <header className="sticky top-0 z-[1000] border-b border-slate-800 bg-slate-50 ">
        {' '}
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
          {' '}
          <div className="flex items-center justify-between gap-4 py-3">
            {' '}
            <div className="flex items-center gap-3">
              {' '}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700">
                {' '}
                <HeartPulse size={22} className="text-white" />{' '}
              </div>{' '}
              <div>
                {' '}
                <h1 className="text-base font-bold leading-tight lg:text-lg">
                  {' '}
                  인천광역시 고령인구·의료취약성 분석{' '}
                </h1>{' '}
                <p className="text-[11px] leading-tight text-slate-500">
                  {' '}
                  행정동별 제공 자료 기반 현황 및 2031 시나리오{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <div className="hidden items-center gap-2 text-xs text-slate-400 lg:flex">
              {' '}
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1">
                {' '}
                행정동 {validation.currentRowCount}곳{' '}
              </span>{' '}
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1">
                {' '}
                의료기관 점 {validation.facilityFeatureCount}곳{' '}
              </span>{' '}
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1">
                {' '}
                2016 · 2021 · 2026 · 2031{' '}
              </span>{' '}
            </div>{' '}
          </div>{' '}
          <nav className="-mb-px flex gap-1 overflow-x-auto scrollbar-thin">
            {' '}
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${isActive ? 'tab-active-indicator border-red-500 text-white' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
                >
                  {' '}
                  <Icon size={16} /> <span>{label}</span>{' '}
                </button>
              );
            })}{' '}
          </nav>{' '}
        </div>{' '}
      </header>{' '}
      <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 lg:p-6">
        {' '}
        {activeTab === 'dashboard' && <MainDashboard />}{' '}
        {activeTab === 'population' && <ElderlyPopulationMap />}{' '}
        {activeTab === 'facilities' && <MedicalFacilitiesMap />}{' '}
        {activeTab === 'clusters' && <ClusterAnalysis />}{' '}
      </main>{' '}
      <footer className="border-t border-slate-200 px-4 py-3 text-center text-[11px] text-slate-500">
        {' '}
        기준 인구: 프로젝트 표기 2026년 6월 / 경계: 제공 파일 2025년 6월 30일 /
        미래: 2031 시나리오{' '}
      </footer>{' '}
    </div>
  );
}
export default function App() {
  return (
    <DashboardDataProvider>
      {' '}
      <DashboardShell />{' '}
    </DashboardDataProvider>
  );
}
