import React from 'react';
import { Activity, GitCompare, BookOpen, Settings, Github, Zap } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab, onOpenSettings, rateLimit }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="flex items-center justify-center w-full h-full bg-[#0b1120] rounded-[10px]">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  Code<span className="text-cyan-400">Pulse</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 rounded">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">GitHub Repository Health Monitor</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('compare')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'compare'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Repos</span>
            </button>

            <button
              onClick={() => onSelectTab('rubric')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'rubric'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Scoring Rubric</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            {/* Rate Limit Badge */}
            {rateLimit && (
              <div
                title={`GitHub API Limit: ${rateLimit.remaining} remaining of ${rateLimit.limit}`}
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>API:</span>
                <span className={rateLimit.remaining < 10 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'}>
                  {rateLimit.remaining}
                </span>
                <span className="text-slate-500">/{rateLimit.limit}</span>
              </div>
            )}

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700"
              title="API Configuration"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition border border-slate-700"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Star on GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/60 bg-[#080c14]/90 text-xs">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center space-x-1 py-1 px-3 rounded-lg ${activeTab === 'dashboard' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onSelectTab('compare')}
          className={`flex items-center space-x-1 py-1 px-3 rounded-lg ${activeTab === 'compare' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Compare</span>
        </button>
        <button
          onClick={() => onSelectTab('rubric')}
          className={`flex items-center space-x-1 py-1 px-3 rounded-lg ${activeTab === 'rubric' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Rubric</span>
        </button>
      </div>
    </header>
  );
}
