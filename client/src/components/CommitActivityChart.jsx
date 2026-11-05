import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { GitCommit, Users, Clock, Flame } from 'lucide-react';
import { formatDate, formatNumber } from '../utils/formatters';

export default function CommitActivityChart({ commitActivity = [], commitStats = {}, contributors = [] }) {
  const { daysSinceLastCommit, recentCommitCount, lastCommitDate } = commitStats;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-2.5 rounded-xl shadow-xl text-xs font-mono">
          <p className="text-slate-400 font-sans">{label}</p>
          <p className="text-cyan-400 font-bold mt-1">
            {payload[0].value} {payload[0].value === 1 ? 'commit' : 'commits'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Commit Activity & Velocity</h3>
            <p className="text-xs text-slate-400">Weekly commit cadence and active contributor distribution</p>
          </div>
        </div>

        {/* Recency Badge */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
            Last commit: {formatDate(lastCommitDate)}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <Flame className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            {recentCommitCount} commits (30d)
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-56 w-full pt-2">
        {commitActivity && commitActivity.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={commitActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="commits"
                stroke="#06B6D4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cyanGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            Commit activity chart is being calculated by GitHub stats engine.
          </div>
        )}
      </div>

      {/* Top Contributors */}
      {contributors && contributors.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Key Contributors</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {contributors.slice(0, 8).map((c) => (
              <a
                key={c.login}
                href={c.html_url || `https://github.com/${c.login}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition group"
              >
                <img
                  src={c.avatar_url}
                  alt={c.login}
                  className="w-5 h-5 rounded-full ring-1 ring-slate-700 group-hover:ring-cyan-400 transition"
                />
                <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                  {c.login}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({formatNumber(c.contributions)})
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
