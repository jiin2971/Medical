import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDashboardData } from '@/data/useDashboardData';
interface SearchBarProps {
  onSelect: (code: string) => void;
}
export function SearchBar({ onSelect }: SearchBarProps) {
  const { records } = useDashboardData();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
  const results = normalizedQuery
    ? records
        .filter((record) =>
          `${record.adm_nm} ${record.sgg_nm ?? ''} ${record.adm_cd}`
            .toLocaleLowerCase('ko-KR')
            .includes(normalizedQuery),
        )
        .slice(0, 8)
    : [];
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const handleSelect = (code: string, name: string) => {
    setQuery(name);
    setOpen(false);
    onSelect(code);
  };
  return (
    <div ref={ref} className="relative w-64">
      {' '}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 ">
        {' '}
        <Search size={16} className="shrink-0 text-slate-400" />{' '}
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="행정동 이름 또는 코드 검색"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />{' '}
        {query && (
          <button
            aria-label="검색어 지우기"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            className="text-slate-500 hover:text-slate-300"
          >
            {' '}
            <X size={14} />{' '}
          </button>
        )}{' '}
      </div>{' '}
      {open && results.length > 0 && (
        <div className="absolute top-full z-[1200] mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white ">
          {' '}
          {results.map((record) => (
            <button
              key={record.adm_cd}
              onClick={() => handleSelect(record.adm_cd, record.adm_nm)}
              className="w-full px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800"
            >
              {' '}
              <span>{record.adm_nm}</span>{' '}
              <span className="ml-2 text-xs text-slate-500">
                · {record.sgg_nm ?? '구·군 자료 없음'}
              </span>{' '}
            </button>
          ))}{' '}
        </div>
      )}{' '}
      {open && normalizedQuery && results.length === 0 && (
        <p className="absolute top-full z-[1200] mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-400">
          {' '}
          검색 결과가 없습니다.{' '}
        </p>
      )}{' '}
    </div>
  );
}
