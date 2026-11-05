import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, Sparkles, X } from 'lucide-react';

const DEMO_SUGGESTIONS = [
  { label: 'React', repo: 'facebook/react', tag: 'UI Library' },
  { label: 'Express', repo: 'expressjs/express', tag: 'Web Framework' },
  { label: 'Next.js', repo: 'vercel/next.js', tag: 'Fullstack' },
  { label: 'Tailwind CSS', repo: 'tailwindlabs/tailwindcss', tag: 'Design System' },
];

export default function SearchBar({ onSearch, isLoading }) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
    }
  };

  const handleSelectDemo = (repo) => {
    setInputVal(repo);
    onSearch(repo);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter public GitHub repository URL or 'owner/repo' (e.g. facebook/react)..."
            disabled={isLoading}
            className="w-full pl-12 pr-36 py-4 text-sm sm:text-base bg-[#0f172a]/90 text-white placeholder-slate-500 rounded-2xl border border-slate-700/80 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 shadow-2xl transition duration-200 outline-none"
          />

          {inputVal && !isLoading && (
            <button
              type="button"
              onClick={() => setInputVal('')}
              className="absolute right-36 p-1 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-95 text-slate-950 font-semibold text-sm rounded-xl transition duration-200 shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Demo Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs">
        <span className="flex items-center text-slate-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1" />
          Try Demo Repositories:
        </span>
        {DEMO_SUGGESTIONS.map((item) => (
          <button
            key={item.repo}
            type="button"
            onClick={() => handleSelectDemo(item.repo)}
            disabled={isLoading}
            className="group flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 hover:border-cyan-500/40 text-slate-300 hover:text-white transition"
          >
            <span className="font-medium">{item.label}</span>
            <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 font-mono">({item.repo})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
