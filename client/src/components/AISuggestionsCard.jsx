import React, { useState } from 'react';
import { Sparkles, Check, Copy, AlertTriangle, Shield, Cpu, BookOpen, Wrench, ChevronDown, ChevronUp } from 'lucide-react';

export default function AISuggestionsCard({ suggestions = {} }) {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const {
    summary = 'Analyzing repository health and generating actionable recommendations...',
    source = 'Groq AI',
    recommendations = [],
    notice = null,
  } = suggestions;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRecs = recommendations.filter((r) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'HIGH') return r.priority === 'HIGH';
    return r.category?.toUpperCase() === selectedFilter;
  });

  const getCategoryIcon = (category) => {
    switch (category?.toUpperCase()) {
      case 'SECURITY':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'CI/CD':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'DOCUMENTATION':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      default:
        return <Wrench className="w-4 h-4 text-amber-400" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="glass-panel-glow rounded-2xl p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>AI-Generated Recommendations</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                {source}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Prioritized tactical improvements generated from health telemetry</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {['ALL', 'HIGH', 'SECURITY', 'CI/CD', 'DOCUMENTATION'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedFilter === filter
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
        <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
          Maintainer Executive Summary
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{summary}</p>
        {notice && (
          <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 italic">
            Note: {notice}
          </p>
        )}
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {filteredRecs.map((rec) => {
          const isExpanded = expandedId === rec.id;
          return (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/90 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-lg bg-slate-800 mt-0.5">
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getPriorityBadge(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">{rec.description}</p>
                  </div>
                </div>

                {rec.codeSnippet && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    className="p-1 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800 shrink-0"
                    title={isExpanded ? 'Collapse snippet' : 'View code fix'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Action Box */}
              <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                <span className="font-semibold text-cyan-400">Action: </span>
                <span>{rec.action}</span>
              </div>

              {/* Code Snippet (Expandable) */}
              {rec.codeSnippet && isExpanded && (
                <div className="relative mt-2">
                  <pre className="p-3 text-xs bg-[#090d16] text-cyan-200 border border-slate-800 rounded-xl overflow-x-auto font-mono">
                    <code>{rec.codeSnippet}</code>
                  </pre>
                  <button
                    onClick={() => handleCopy(rec.id, rec.codeSnippet)}
                    className="absolute top-2 right-2 px-2.5 py-1 text-[11px] font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1 transition"
                  >
                    {copiedId === rec.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
