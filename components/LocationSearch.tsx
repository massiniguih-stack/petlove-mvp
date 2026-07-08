'use client';

import { useState, useRef, useEffect } from 'react';

interface Localizacao {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  tipo: string;
}

interface LocationSearchProps {
  locais: Localizacao[];
  onSelect: (local: Localizacao) => void;
  onClear: () => void;
}

export default function LocationSearch({ locais, onSelect, onClear }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [sugestoes, setSugestoes] = useState<Localizacao[]>([]);
  const [aberto, setAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Localizacao | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (local: Localizacao) => {
    setQuery(local.nome);
    setSelecionado(local);
    setAberto(false);
    onSelect(local);
  };

  const handleClear = () => {
    setQuery('');
    setSugestoes([]);
    setSelecionado(null);
    setAberto(false);
    onClear();
    inputRef.current?.focus();
  };

  const handleSearch = () => {
    if (query.length < 2) {
      setSugestoes([]);
      setAberto(false);
      return;
    }
    const termo = query.toLowerCase();
    const filtrados = locais.filter((l) =>
      l.nome.toLowerCase().includes(termo) ||
      l.endereco.toLowerCase().includes(termo) ||
      l.bairro.toLowerCase().includes(termo) ||
      l.cidade.toLowerCase().includes(termo)
    ).slice(0, 6);
    setSugestoes(filtrados);
    setAberto(filtrados.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleFocus = () => {
    if (sugestoes.length > 0) setAberto(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm transition-all duration-200 ${
        aberto ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300'
      }`}>
        <svg className="h-5 w-5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Buscar por local, endereço ou bairro..."
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        {query.length >= 2 && (
          <button
            onClick={handleSearch}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-600 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        )}
        {selecionado && (
          <button
            onClick={handleClear}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {aberto && sugestoes.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {sugestoes.map((local) => (
            <button
              key={local.id}
              onClick={() => handleSelect(local)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{local.nome}</p>
                <p className="text-xs text-slate-500 truncate">{local.endereco}</p>
                <p className="text-xs text-slate-400">{local.bairro} · {local.cidade}, {local.uf}</p>
              </div>
              <span className="mt-1 text-xs text-slate-400">
                📍
              </span>
            </button>
          ))}

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5">
            <p className="text-xs text-slate-500">
              {sugestoes.length} resultado{sugestoes.length > 1 ? 's' : ''} encontrado{sugestoes.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
