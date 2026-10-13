import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { DONG_NAMES } from '@/data/mockData';

interface SearchBarProps {
  onSelect: (code: string) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ code: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    const q = query.trim();
    setResults(
      DONG_NAMES.filter((d) => d.name.includes(q)).slice(0, 8),
    );
  }, [query]);

  const handleSelect = (code: string, name: string) => {
    setQuery(name);
    setOpen(false);
    onSelect(code);
  };

  return (
    <div ref={ref} className="relative w-64">
      <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 px-3 py-2 shadow-xl">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="행정동 검색..."
          className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="text-slate-500 hover:text-slate-300"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden z-[1200]">
          {results.map((r) => (
            <button
              key={r.code}
              onClick={() => handleSelect(r.code, r.name)}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
