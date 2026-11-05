import React from 'react';
import { CheckCircle2, XCircle, Scale, Cpu, FileCheck2, GitBranch, ShieldAlert } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function CodeQualityCard({ treeStats = {}, repoInfo = {} }) {
  const { hasCiCd, hasTests, hasLinters, totalFiles } = treeStats;
  const { license, archived, size, default_branch } = repoInfo;

  const qualityItems = [
    {
      title: 'Automated CI/CD Workflows',
      description: 'Continuous Integration tests builds on pull requests',
      passed: Boolean(hasCiCd),
      details: hasCiCd ? 'GitHub Actions / CI workflows active' : 'No CI configuration found (.github/workflows)',
    },
    {
      title: 'Automated Test Suite',
      description: 'Presence of unit, integration, or e2e test directories',
      passed: Boolean(hasTests),
      details: hasTests ? 'Tests suite detected' : 'No test suite or config identified',
    },
    {
      title: 'Code Linters & Formatting',
      description: 'Enforces consistent style rules and catches code smells',
      passed: Boolean(hasLinters),
      details: hasLinters ? 'Linter / Formatter config present' : 'No linter config detected',
    },
    {
      title: 'Open Source License',
      description: 'Permissive legal distribution terms for community use',
      passed: Boolean(license),
      details: license?.name || 'No formal LICENSE file recognized',
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Code Quality & Architecture</h3>
            <p className="text-xs text-slate-400">CI/CD automation, testing infrastructure, and licensing</p>
          </div>
        </div>

        {archived && (
          <span className="flex items-center px-2.5 py-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            Archived Repository
          </span>
        )}
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {qualityItems.map((item, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border transition ${
              item.passed
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-amber-950/15 border-amber-900/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-200">{item.title}</span>
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
            <div className="mt-2 text-xs font-mono font-medium text-cyan-400 truncate">
              {item.details}
            </div>
          </div>
        ))}
      </div>

      {/* Codebase Meta bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-1.5">
          <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
          <span>Default branch:</span>
          <span className="font-mono font-semibold text-slate-200">{default_branch || 'main'}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tracked files:</span>
          <span className="font-mono font-semibold text-slate-200">{formatNumber(totalFiles)}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Scale className="w-3.5 h-3.5 text-emerald-400" />
          <span>Repo size:</span>
          <span className="font-mono font-semibold text-slate-200">{formatNumber(size)} KB</span>
        </div>
      </div>
    </div>
  );
}
