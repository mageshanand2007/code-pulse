import React, { useState } from 'react';
import { Package, ShieldCheck, AlertTriangle, Layers, FileCode, Check, X } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function DependencyAnalysisCard({ dependencyAnalysis = {} }) {
  const [activeTab, setActiveTab] = useState('direct');

  const {
    detected = false,
    ecosystem = 'Unknown',
    manifestFile = null,
    totalDependencies = 0,
    directCount = 0,
    devCount = 0,
    dependencies = [],
    devDependencies = [],
    hasLockfile = false,
    lockfileName = null,
    unpinnedCount = 0,
    healthScore = 100,
    warnings = [],
    highlights = [],
  } = dependencyAnalysis;

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Dependency Hygiene</h3>
            <p className="text-xs text-slate-400">Lockfile verification, version pinning, and footprint audit</p>
          </div>
        </div>

        {/* Ecosystem & Lockfile badge */}
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
            {ecosystem}
          </span>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
            hasLockfile
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {hasLockfile ? `Lockfile: ${lockfileName || 'Yes'}` : 'Missing Lockfile'}
          </span>
        </div>
      </div>

      {/* Stats Quickbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
          <div className="text-slate-400">Total Packages</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">{formatNumber(totalDependencies)}</div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
          <div className="text-slate-400">Direct Runtime</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">{directCount}</div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
          <div className="text-slate-400">Dev Dependencies</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">{devCount}</div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
          <div className="text-slate-400">Unpinned Versions</div>
          <div className={`text-base font-bold font-mono mt-0.5 ${unpinnedCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {unpinnedCount}
          </div>
        </div>
      </div>

      {/* Warnings & Highlights */}
      {warnings && warnings.length > 0 && (
        <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-1 text-xs text-amber-200">
          <div className="flex items-center font-semibold text-amber-400">
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            Dependency Warnings
          </div>
          {warnings.map((w, i) => (
            <div key={i} className="pl-5">• {w}</div>
          ))}
        </div>
      )}

      {/* Tabbed Dependency List */}
      {detected && (dependencies.length > 0 || devDependencies.length > 0) && (
        <div>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
            <button
              onClick={() => setActiveTab('direct')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'direct'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Direct Packages ({dependencies.length})
            </button>
            {devDependencies.length > 0 && (
              <button
                onClick={() => setActiveTab('dev')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'dev'
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dev Packages ({devDependencies.length})
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {(activeTab === 'direct' ? dependencies : devDependencies).map((dep, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 text-xs font-mono"
              >
                <span className="text-slate-200 font-medium">{dep.name}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] ${
                  dep.isUnpinned ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {dep.version}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
