import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import PillButton from '@/components/Common/PillButton';
import { searchStocks } from '@/services/stockSearchService';
import type { StockSearchResult } from '@/types/trading';
import Badge from '@/components/Common/Badge';

interface Props {
  onSelect: (stock: StockSearchResult) => void;
  placeholder?: string;
  className?: string;
}

const exchangeFilters = [
  { label: '🌐 All', value: '' },
  { label: '📊 Equity', value: 'NSE' },
  { label: '📈 F&O', value: 'NFO' },
  { label: 'BSE', value: 'BSE' },
  { label: '🪙 MCX', value: 'MCX' },
];

const StockSearchUniversal: React.FC<Props> = ({ onSelect, placeholder = 'Search any stock, F&O...', className = '' }) => {
  const [query, setQuery] = useState('');
  const [exchange, setExchange] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<StockSearchResult[]>([]);
  const timerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('st_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}
  }, []);

  const doSearch = useCallback(async (q: string, exch: string) => {
    if (!q || q.length < 1) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await searchStocks(q, exch || undefined);
      setResults(res);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val, exchange), 300);
  };

  const handleSelect = (stock: StockSearchResult) => {
    onSelect(stock);
    setQuery('');
    setResults([]);
    setFocused(false);
    const updated = [stock, ...recentSearches.filter(s => s.token !== stock.token)].slice(0, 20);
    setRecentSearches(updated);
    localStorage.setItem('st_recent_searches', JSON.stringify(updated));
  };

  const handleExchangeFilter = (val: string) => {
    setExchange(val);
    if (query) doSearch(query, val);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const badgeColor = (exch: string) => {
    if (exch === 'NSE') return 'info';
    if (exch === 'BSE') return 'warning';
    if (exch === 'NFO') return 'ai';
    if (exch === 'MCX') return 'success';
    return 'info';
  };

  const showDropdown = focused && (results.length > 0 || (query.length === 0 && recentSearches.length > 0));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center bg-input border border-border rounded-xl h-12 px-3 gap-2">
        <Search size={18} className="text-muted-foreground shrink-0" />
        <input
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          placeholder={placeholder}
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
        />
        {loading && <Loader2 size={16} className="animate-spin text-info shrink-0" />}
        {query && <button onClick={() => { setQuery(''); setResults([]); }} className="p-1"><X size={16} className="text-muted-foreground" /></button>}
      </div>

      {focused && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto hide-scrollbar">
          {exchangeFilters.map(f => (
            <PillButton key={f.value} active={exchange === f.value} onClick={() => handleExchangeFilter(f.value)}>
              {f.label}
            </PillButton>
          ))}
        </div>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-[350px] overflow-y-auto z-[1000]">
          {query.length === 0 && recentSearches.length > 0 && (
            <>
              <p className="text-[11px] text-muted-foreground px-3 pt-2 pb-1 font-bold">🕐 Recent Searches</p>
              {recentSearches.slice(0, 5).map(s => (
                <button key={s.token + s.exchange} onClick={() => handleSelect(s)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/20 min-h-[48px]">
                  <div className="text-left">
                    <span className="text-sm font-bold">{s.symbol}</span>
                    <span className="text-[11px] text-muted-foreground ml-2">{s.name}</span>
                  </div>
                  <Badge variant={badgeColor(s.exchange) as any}>{s.exchange}</Badge>
                </button>
              ))}
            </>
          )}
          {results.map(s => (
            <button key={s.token + s.exchange} onClick={() => handleSelect(s)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/20 min-h-[48px] border-t border-border/30">
              <div className="text-left">
                <span className="text-sm font-bold">{s.symbol}</span>
                <span className="text-[11px] text-muted-foreground ml-2">{s.name}</span>
              </div>
              <div className="flex gap-1">
                <Badge variant={badgeColor(s.exchange) as any}>{s.exchange}</Badge>
                <span className="text-[10px] text-muted-foreground">{s.instrumentType}</span>
              </div>
            </button>
          ))}
          {query && !loading && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">No results found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearchUniversal;
