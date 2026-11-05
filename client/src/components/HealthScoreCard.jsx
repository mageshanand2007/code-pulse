import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle2, AlertTriangle, Award, ShieldCheck, HeartPulse } from 'lucide-react';
import { getGradeBadge } from '../utils/formatters';

export default function HealthScoreCard({ healthResult, repoName }) {
  const { overallScore, grade, gradeLabel, pillars, strengths, improvements } = healthResult;
  const gradeStyles = getGradeBadge(grade);

  useEffect(() => {
    if (overallScore >= 90) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06B6D4', '#10B981', '#6366F1'],
        });
      } catch {}
    }
  }, [overallScore]);

  // Data for radar chart
  const radarData = [
    { subject: 'Docs', score: pillars.documentation.score, fullMark: 100 },
    { subject: 'Maintenance', score: pillars.maintenance.score, fullMark: 100 },
    { subject: 'Issues/PRs', score: pillars.issuesAndPrs.score, fullMark: 100 },
    { subject: 'Code Quality', score: pillars.codeQuality.score, fullMark: 100 },
    { subject: 'Security', score: pillars.security.score, fullMark: 100 },
    { subject: 'Dependencies', score: pillars.dependencies.score, fullMark: 100 },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Giant Score & Grade */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            <HeartPulse className="w-4 h-4 text-cyan-400" />
            <span>Repository Health Score</span>
          </div>

          {/* Radial score gauge visualizer */}
          <div className="relative flex items-center justify-center w-40 h-40 my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="text-slate-800 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-current transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * overallScore) / 100}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  stroke: overallScore >= 80 ? '#10B981' : overallScore >= 60 ? '#06B6D4' : overallScore >= 45 ? '#F59E0B' : '#F43F5E',
                }}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">{overallScore}</span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
          </div>

          {/* Grade Badge */}
          <div className={`mt-3 inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl border ${gradeStyles.bg} ${gradeStyles.border} ${gradeStyles.text} ${gradeStyles.glow}`}>
            <Award className="w-4 h-4" />
            <span className="text-lg font-bold">Grade {grade}</span>
            <span className="text-xs font-medium opacity-80">({gradeLabel})</span>
          </div>
        </div>

        {/* Middle: 6-Pillar Radar Chart */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center h-64">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            6-Pillar Balance Matrix
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 9 }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#06B6D4"
                fill="#06B6D4"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Pillar Score Bars */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Pillar Breakdown
          </h4>

          {Object.entries(pillars).map(([key, p]) => {
            const labelMap = {
              documentation: 'Documentation & Community',
              maintenance: 'Maintenance Cadence',
              issuesAndPrs: 'Issues & PR Velocity',
              codeQuality: 'Code Quality & Tests',
              security: 'Security Posture',
              dependencies: 'Dependency Health',
            };

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{labelMap[key]}</span>
                  <span className="text-white font-mono font-semibold">{p.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${p.score}%`,
                      backgroundColor:
                        p.score >= 80 ? '#10B981' : p.score >= 60 ? '#06B6D4' : p.score >= 45 ? '#F59E0B' : '#F43F5E',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Improvements Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-300">
            {strengths.slice(0, 3).map((s, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Areas to Improve</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-300">
            {improvements.slice(0, 3).map((imp, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
