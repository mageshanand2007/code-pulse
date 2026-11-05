import React from 'react';
import { BookOpen, FileText, Check, X, Clock, Layers } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function DocumentationCard({ readmeAnalysis }) {
  if (!readmeAnalysis) return null;

  const {
    present,
    score,
    wordCount,
    lineCount,
    codeBlockCount,
    badgeCount,
    detectedSections = [],
    missingSections = [],
    readabilityGrade,
    estimatedReadTimeMinutes,
  } = readmeAnalysis;

  const essentialList = [
    'Title & Overview',
    'Installation Guide',
    'Usage & Examples',
    'Features',
    'Contributing Guidelines',
    'License Notice',
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Documentation Quality</h3>
            <p className="text-xs text-slate-400">README completeness, structural clarity, and essential guides</p>
          </div>
        </div>

        {/* Readme Score Badge */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Score:</span>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
            score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
            score >= 60 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
            'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {score}/100 ({readabilityGrade})
          </span>
        </div>
      </div>

      {/* Stats Quickbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
          <div className="text-slate-400">Words</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">{formatNumber(wordCount)}</div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
          <div className="text-slate-400">Read Time</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">~{estimatedReadTimeMinutes} min</div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
          <div className="text-slate-400">Code Blocks</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">{codeBlockCount}</div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
          <div className="text-slate-400">Status Badges</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">{badgeCount}</div>
        </div>
      </div>

      {/* Section Checklist */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Essential Section Verification
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {essentialList.map((sec) => {
            const isDetected = detectedSections.includes(sec);
            return (
              <div
                key={sec}
                className={`flex items-center justify-between p-2.5 rounded-lg border ${
                  isDetected
                    ? 'bg-slate-900/40 border-slate-800 text-slate-200'
                    : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                }`}
              >
                <span className="font-medium">{sec}</span>
                {isDetected ? (
                  <span className="flex items-center text-emerald-400 font-semibold text-[11px]">
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Present
                  </span>
                ) : (
                  <span className="flex items-center text-rose-400 font-semibold text-[11px]">
                    <X className="w-3.5 h-3.5 mr-1" />
                    Missing
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
