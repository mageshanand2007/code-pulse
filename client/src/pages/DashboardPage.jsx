import React, { useState } from 'react';
import {
  Star,
  GitFork,
  Eye,
  ExternalLink,
  RotateCw,
  Share2,
  Tag,
  Shield,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import HealthScoreCard from '../components/HealthScoreCard';
import CommitActivityChart from '../components/CommitActivityChart';
import IssuesPrCard from '../components/IssuesPrCard';
import DocumentationCard from '../components/DocumentationCard';
import CodeQualityCard from '../components/CodeQualityCard';
import SecurityRiskCard from '../components/SecurityRiskCard';
import DependencyAnalysisCard from '../components/DependencyAnalysisCard';
import AISuggestionsCard from '../components/AISuggestionsCard';
import ExportReportModal from '../components/ExportReportModal';
import { formatNumber } from '../utils/formatters';

export default function DashboardPage({
  reportData,
  isLoading,
  error,
  onSearch,
  onRefresh,
}) {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Search Section */}
      <div className="text-center space-y-3 pt-4 sm:pt-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Telemetry & AI Maintainer Recommendations</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          GitHub Repository <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Health & Risk Monitor
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Audit any public GitHub repository. Compute 100-point composite health grades, detect exposed secrets, analyze documentation, and get AI-powered remediation blueprints.
        </p>

        {/* Main Search Input */}
        <SearchBar onSearch={onSearch} isLoading={isLoading} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto p-4 bg-rose-950/40 border border-rose-800/80 rounded-2xl flex items-start space-x-3 text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-rose-300">Analysis Error</p>
            <p className="mt-0.5 text-xs text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-center space-x-3 py-16">
            <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
            <span className="text-base font-medium text-slate-300 font-mono">
              Fetching GitHub API tree, scanning secrets, and synthesizing metrics...
            </span>
          </div>
        </div>
      )}

      {/* Main Report Dashboard */}
      {!isLoading && reportData && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Repository Header Bar */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <img
                src={reportData.repoInfo.owner?.avatar_url}
                alt={reportData.repoInfo.owner?.login}
                className="w-14 h-14 rounded-2xl ring-2 ring-slate-700/80 shrink-0 shadow-lg"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {reportData.repoInfo.full_name}
                  </h2>
                  <a
                    href={reportData.repoInfo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-white transition"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-normal">
                  {reportData.repoInfo.description || 'No description provided.'}
                </p>

                {/* Topics */}
                {reportData.repoInfo.topics && reportData.repoInfo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {reportData.repoInfo.topics.slice(0, 6).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-300 rounded-md border border-slate-700/60"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                <div className="flex items-center space-x-1 text-amber-400" title="Stars">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-white">{formatNumber(reportData.repoInfo.stargazers_count)}</span>
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center space-x-1 text-cyan-400" title="Forks">
                  <GitFork className="w-3.5 h-3.5" />
                  <span className="font-bold text-white">{formatNumber(reportData.repoInfo.forks_count)}</span>
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center space-x-1 text-indigo-400" title="Watchers">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="font-bold text-white">{formatNumber(reportData.repoInfo.watchers_count || reportData.repoInfo.subscribers_count)}</span>
                </div>
              </div>

              <button
                onClick={onRefresh}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
                title="Force refresh live data"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 rounded-xl transition shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* 1. Health Score Hero Card */}
          <HealthScoreCard
            healthResult={reportData.healthResult}
            repoName={reportData.repoInfo.full_name}
          />

          {/* 2. Interactive Charts & Deep Dives (2 Column Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CommitActivityChart
              commitActivity={reportData.commitActivity}
              commitStats={reportData.commitStats}
              contributors={reportData.contributors}
            />

            <IssuesPrCard
              issuesStats={reportData.issuesStats}
            />

            <DocumentationCard
              readmeAnalysis={reportData.readmeAnalysis}
            />

            <CodeQualityCard
              treeStats={reportData.treeStats}
              repoInfo={reportData.repoInfo}
            />

            <SecurityRiskCard
              securityScan={reportData.securityScan}
            />

            <DependencyAnalysisCard
              dependencyAnalysis={reportData.dependencyAnalysis}
            />
          </div>

          {/* 3. AI Suggestions Section */}
          <AISuggestionsCard
            suggestions={reportData.suggestions}
          />

          {/* Export Modal */}
          <ExportReportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            reportData={reportData}
          />
        </div>
      )}
    </div>
  );
}
