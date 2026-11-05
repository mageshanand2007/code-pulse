import React, { useState } from 'react';
import {
  GitCompare,
  Trophy,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { compareRepositories } from '../services/api';
import { formatNumber } from '../utils/formatters';

const PRESET_PAIRS = [
  { name: 'React vs Next.js', repo1: 'facebook/react', repo2: 'vercel/next.js' },
  { name: 'React vs Express', repo1: 'facebook/react', repo2: 'expressjs/express' },
];

export default function ComparePage() {
  const [repo1, setRepo1] = useState('facebook/react');
  const [repo2, setRepo2] = useState('vercel/next.js');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleCompare = async (r1 = repo1, r2 = repo2) => {
    if (!r1.trim() || !r2.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await compareRepositories(r1.trim(), r2.trim());
      setComparisonResult(data);
    } catch (err) {
      setError(err.message || 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (p1, p2) => {
    setRepo1(p1);
    setRepo2(p2);
    handleCompare(p1, p2);
  };

  // Build radar data if comparison exists
  const radarData = comparisonResult
    ? [
        {
          pillar: 'Docs',
          [comparisonResult.repo1.repoInfo.name]: comparisonResult.repo1.healthResult.pillars.documentation.score,
          [comparisonResult.repo2.repoInfo.name]: comparisonResult.repo2.healthResult.pillars.documentation.score,
        },
        {
          pillar: 'Maintenance',
          [comparisonResult.repo1.repoInfo.name]: comparisonResult.repo1.healthResult.pillars.maintenance.score,
          [comparisonResult.repo2.repoInfo.name]: comparisonResult.repo2.healthResult.pillars.maintenance.score,
        },
        {
          pillar: 'Issues & PRs',
          [comparisonResult.repo1.repoInfo.name]: comparisonResult.repo1.healthResult.pillars.issuesAndPrs.score,
          [comparisonResult.repo2.repoInfo.name]: comparisonResult.repo2.healthResult.pillars.issuesAndPrs.score,
        },
        {
          pillar: 'Quality',
          [comparisonResult.repo1.repoInfo.name]: comparisonResult.repo1.healthResult.pillars.codeQuality.score,
          [comparisonResult.repo2.repoInfo.name]: comparisonResult.repo2.healthResult.pillars.codeQuality.score,
        },
        {
          pillar: 'Security',
          [comparisonResult.repo1.repoInfo.name]: comparisonResult.repo1.healthResult.pillars.security.score,
          [comparisonResult.repo2.repoInfo.name]: comparisonResult.repo2.healthResult.pillars.security.score,
        },
        {
          pillar: 'Dependencies',
          [comparisonResult.repo1.repoInfo.name]: comparisonResult.repo1.healthResult.pillars.dependencies.score,
          [comparisonResult.repo2.repoInfo.name]: comparisonResult.repo2.healthResult.pillars.dependencies.score,
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pt-4">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Head-to-Head Architectural Audit</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Repository Comparison</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Compare two open-source projects across documentation, maintenance cadence, issue turnaround, and security posture.
        </p>
      </div>

      {/* Comparison Input Card */}
      <div className="glass-panel p-6 rounded-2xl max-w-3xl mx-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Repository 1
            </label>
            <input
              type="text"
              value={repo1}
              onChange={(e) => setRepo1(e.target.value)}
              placeholder="e.g. facebook/react"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Repository 2
            </label>
            <input
              type="text"
              value={repo2}
              onChange={(e) => setRepo2(e.target.value)}
              placeholder="e.g. vercel/next.js"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Button & Presets */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Pairs:</span>
            {PRESET_PAIRS.map((pair, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(pair.repo1, pair.repo2)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
              >
                {pair.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCompare()}
            disabled={isLoading || !repo1.trim() || !repo2.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-90 text-slate-950 font-bold text-sm rounded-xl transition shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Comparing...</span>
              </>
            ) : (
              <>
                <span>Run Comparison</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto p-4 bg-rose-950/40 border border-rose-800 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-amber-400 tracking-wider">
                  Overall Health Winner
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {comparisonResult.comparison.overallWinner}
                </h3>
                <p className="text-xs text-slate-400">
                  Leads by {comparisonResult.comparison.scoreDiff} points in overall composite scoring.
                </p>
              </div>
            </div>

            {/* Score Pill comparison */}
            <div className="flex items-center space-x-3 text-center">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">{comparisonResult.repo1.repoInfo.name}</div>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {comparisonResult.repo1.healthResult.overallScore}
                </div>
              </div>
              <span className="text-slate-600 font-bold">VS</span>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">{comparisonResult.repo2.repoInfo.name}</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {comparisonResult.repo2.healthResult.overallScore}
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Radar & Metrics Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Comparative Radar */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col items-center">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Comparative Pillar Radar
              </h4>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="pillar" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 9 }} />
                    <Radar
                      name={comparisonResult.repo1.repoInfo.name}
                      dataKey={comparisonResult.repo1.repoInfo.name}
                      stroke="#06B6D4"
                      fill="#06B6D4"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={comparisonResult.repo2.repoInfo.name}
                      dataKey={comparisonResult.repo2.repoInfo.name}
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Direct Metric Table */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Category Breakdown & Winner
              </h4>

              <div className="space-y-2.5">
                {comparisonResult.comparison.pillarComparison.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-200">{item.pillar}</span>
                    <div className="flex items-center space-x-6">
                      <span className="font-mono text-cyan-400 font-bold">{item.score1}%</span>
                      <span className="text-slate-600 font-bold">vs</span>
                      <span className="font-mono text-emerald-400 font-bold">{item.score2}%</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 w-24 text-center">
                        Winner: {item.winner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra Stats comparison */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-medium">{comparisonResult.repo1.repoInfo.name}</div>
                  <div className="text-slate-200">Stars: <strong className="font-mono">{formatNumber(comparisonResult.repo1.repoInfo.stargazers_count)}</strong></div>
                  <div className="text-slate-200">Forks: <strong className="font-mono">{formatNumber(comparisonResult.repo1.repoInfo.forks_count)}</strong></div>
                  <div className="text-slate-200">License: <strong className="font-mono">{comparisonResult.repo1.repoInfo.license?.name || 'None'}</strong></div>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-medium">{comparisonResult.repo2.repoInfo.name}</div>
                  <div className="text-slate-200">Stars: <strong className="font-mono">{formatNumber(comparisonResult.repo2.repoInfo.stargazers_count)}</strong></div>
                  <div className="text-slate-200">Forks: <strong className="font-mono">{formatNumber(comparisonResult.repo2.repoInfo.forks_count)}</strong></div>
                  <div className="text-slate-200">License: <strong className="font-mono">{comparisonResult.repo2.repoInfo.license?.name || 'None'}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
