import { useState } from 'react';
import { LayoutDashboard, Users, Building2, TrendingUp, HeartPulse } from 'lucide-react';
import { MainDashboard } from '@/components/tabs/MainDashboard';
import { ElderlyPopulationMap } from '@/components/tabs/ElderlyPopulationMap';
import { MedicalFacilitiesMap } from '@/components/tabs/MedicalFacilitiesMap';
import { ClusterAnalysis } from '@/components/tabs/ClusterAnalysis';

type TabId = 'dashboard' | 'population' | 'facilities' | 'clusters';

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof LayoutDashboard;
}

const TABS: TabDef[] = [
  { id: 'dashboard', label: '메인 대시보드', icon: LayoutDashboard },
  { id: 'population', label: '고령인구 분포', icon: Users },
  { id: 'facilities', label: '의료시설 분포', icon: Building2 },
  { id: 'clusters', label: '위험등급 분석', icon: TrendingUp },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-[1000] bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700">
                <HeartPulse size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-base lg:text-lg font-bold leading-tight">
                  인천광역시 고령화 인구 및 의료취약성 분석
                </h1>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Incheon Metropolitan City · Aging Population & Medical Vulnerability Dashboard
                </p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/30">
                151개 행정동
              </span>
              <span className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/30">
                2SFCA + 위험등급
              </span>
              <span className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/30">
                2020-2026 시계열
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-thin -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-white border-red-500 tab-active-indicator'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6">
        {activeTab === 'dashboard' && <MainDashboard />}
        {activeTab === 'population' && <ElderlyPopulationMap />}
        {activeTab === 'facilities' && <MedicalFacilitiesMap />}
        {activeTab === 'clusters' && <ClusterAnalysis />}
      </main>

      <footer className="py-3 border-t border-slate-800/50 text-center text-[11px] text-slate-600">
        데이터 출처: KOSTAT 2018 행정구역 경계 | 인천광역시 · Incheon Metropolitan City
      </footer>
    </div>
  );
}

export default App;
