import React from 'react';
import { CircleDot, GitPullRequest, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function IssuesPrCard({ issuesStats }) {
  if (!issuesStats) return null;

  const {
    openIssues,
    closedIssues,
    closeRate,
    openPrs,
    closedPrs,
    mergedPrs,
    prMergeRate,
    medianResolutionDays,
    staleCount,
    stalePercent,
  } = issuesStats;

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <CircleDot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Issues & Pull Requests</h3>
          <p className="text-xs text-slate-400">Triage responsiveness, resolution speed, and PR merge velocity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Issues Box */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
              <CircleDot className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
              Issue Triage
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${closeRate >= 70 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {closeRate}% Closed
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-bold text-white">{formatNumber(openIssues)}</span>
              <span className="text-xs text-slate-400 ml-1.5">open</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-slate-300 font-mono">{formatNumber(closedIssues)}</span>
              <span className="text-xs text-slate-500 ml-1">resolved</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${closeRate}%` }}
              title={`Closed: ${closeRate}%`}
            />
            <div
              className="bg-amber-500 h-full"
              style={{ width: `${100 - closeRate}%` }}
              title={`Open: ${100 - closeRate}%`}
            />
          </div>
        </div>

        {/* PRs Box */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
              <GitPullRequest className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
              Pull Requests
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${prMergeRate >= 70 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
              {prMergeRate}% Merged
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-bold text-white">{formatNumber(openPrs)}</span>
              <span className="text-xs text-slate-400 ml-1.5">open PRs</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-slate-300 font-mono">{formatNumber(mergedPrs)}</span>
              <span className="text-xs text-slate-500 ml-1">merged</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-indigo-500 h-full"
              style={{ width: `${prMergeRate}%` }}
              title={`Merged: ${prMergeRate}%`}
            />
            <div
              className="bg-slate-700 h-full"
              style={{ width: `${100 - prMergeRate}%` }}
              title={`Unmerged: ${100 - prMergeRate}%`}
            />
          </div>
        </div>
      </div>

      {/* Resolution & Stale Stats Footer */}
      <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
        <div className="flex items-center space-x-2 p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/80">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="text-slate-400">Median Resolution</div>
            <div className="font-semibold text-white font-mono">{medianResolutionDays} days</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/80">
          {stalePercent > 20 ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <div className="text-slate-400">Stale Ratio (&gt;60d)</div>
            <div className="font-semibold text-white font-mono">{stalePercent}% ({staleCount} stale)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
