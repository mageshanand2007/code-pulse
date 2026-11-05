import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertOctagon, Check, X, Lock } from 'lucide-react';
import { getRiskBadge } from '../utils/formatters';

export default function SecurityRiskCard({ securityScan = {} }) {
  const {
    score = 100,
    riskLevel = 'LOW',
    exposedFiles = [],
    hasGitignore,
    hasSecurityPolicy,
    hasDependabot,
    issues = [],
    findings = [],
    recommendations = [],
  } = securityScan;

  const riskBadge = getRiskBadge(riskLevel);

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Security & Risk Posture</h3>
            <p className="text-xs text-slate-400">Secret exposure scan, vulnerability policies, and Dependabot auditing</p>
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${riskBadge.bg}`}>
          {riskLevel === 'LOW' ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <AlertOctagon className="w-3.5 h-3.5" />
          )}
          <span>{riskBadge.label} ({score}/100)</span>
        </div>
      </div>

      {/* Exposed Sensitive Files Alert (If any) */}
      {exposedFiles && exposedFiles.length > 0 && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>CRITICAL: Exposed Sensitive Files Detected!</span>
          </div>
          <p className="text-xs text-rose-200">
            The following files appear to be committed directly into Git tracking:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {exposedFiles.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-mono font-semibold bg-rose-900/60 border border-rose-700 text-rose-100 rounded-lg"
              >
                {item.file} ({item.severity})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Security Checkpoints */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* .gitignore */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="text-slate-300 font-medium">.gitignore configured</span>
          {hasGitignore ? (
            <span className="flex items-center text-emerald-400 font-semibold text-[11px]">
              <Check className="w-3.5 h-3.5 mr-1" />
              Verified
            </span>
          ) : (
            <span className="flex items-center text-rose-400 font-semibold text-[11px]">
              <X className="w-3.5 h-3.5 mr-1" />
              Missing
            </span>
          )}
        </div>

        {/* SECURITY.md */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="text-slate-300 font-medium">SECURITY.md policy</span>
          {hasSecurityPolicy ? (
            <span className="flex items-center text-emerald-400 font-semibold text-[11px]">
              <Check className="w-3.5 h-3.5 mr-1" />
              Active
            </span>
          ) : (
            <span className="flex items-center text-amber-400 font-semibold text-[11px]">
              <X className="w-3.5 h-3.5 mr-1" />
              Missing
            </span>
          )}
        </div>

        {/* Dependabot */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="text-slate-300 font-medium">Automated CVE Scan</span>
          {hasDependabot ? (
            <span className="flex items-center text-emerald-400 font-semibold text-[11px]">
              <Check className="w-3.5 h-3.5 mr-1" />
              Enabled
            </span>
          ) : (
            <span className="flex items-center text-amber-400 font-semibold text-[11px]">
              <X className="w-3.5 h-3.5 mr-1" />
              Unconfigured
            </span>
          )}
        </div>
      </div>

      {/* Security Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="pt-2 text-xs space-y-1.5">
          <div className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
            Security Advice
          </div>
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start space-x-2 text-slate-300">
              <span className="text-cyan-400 font-bold">•</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
