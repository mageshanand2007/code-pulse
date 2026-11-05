import React, { useState } from 'react';
import { X, Copy, Check, Download, Printer, FileText } from 'lucide-react';

export default function ExportReportModal({ isOpen, onClose, reportData }) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  if (!isOpen || !reportData) return null;

  const { repoInfo, healthResult, readmeAnalysis, securityScan, dependencyAnalysis, issuesStats } = reportData;

  const markdownReport = `# CodePulse Health Audit Report: ${repoInfo.full_name}

**Date Generated:** ${new Date().toLocaleDateString()}
**Overall Health Score:** ${healthResult.overallScore}/100 (Grade ${healthResult.grade} - ${healthResult.gradeLabel})

---

## 📊 Pillar Breakdown
- **Documentation & Community:** ${healthResult.pillars.documentation.score}%
- **Maintenance & Cadence:** ${healthResult.pillars.maintenance.score}%
- **Issues & PR Velocity:** ${healthResult.pillars.issuesAndPrs.score}%
- **Code Quality & Architecture:** ${healthResult.pillars.codeQuality.score}%
- **Security & Risk Posture:** ${healthResult.pillars.security.score}%
- **Dependency Hygiene:** ${healthResult.pillars.dependencies.score}%

---

## 🛡️ Security & Quality Highlights
- **Security Risk Level:** ${securityScan?.riskLevel || 'LOW'}
- **License:** ${repoInfo.license?.name || 'No License'}
- **Lockfile Present:** ${dependencyAnalysis?.hasLockfile ? 'Yes (' + dependencyAnalysis.lockfileName + ')' : 'No'}
- **Open Issues:** ${issuesStats?.openIssues || 0} (Close Rate: ${issuesStats?.closeRate || 0}%)
- **PR Merge Rate:** ${issuesStats?.prMergeRate || 0}%

---

## 💡 Key AI Recommendations
${reportData.suggestions?.recommendations?.map(r => `- **[${r.priority}] ${r.title}:** ${r.action}`).join('\n') || 'None'}

*Report audited by [CodePulse](https://github.com)*
`;

  const badgeSnippet = `[![CodePulse Health: ${healthResult.overallScore}/100](https://img.shields.io/badge/CodePulse-${healthResult.overallScore}%2F100-${healthResult.overallScore >= 80 ? 'brightgreen' : 'orange'})](${repoInfo.html_url})`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyBadge = () => {
    navigator.clipboard.writeText(badgeSnippet);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codepulse-${repoInfo.name}-health-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl p-6 bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Export Health Audit Report</h3>
              <p className="text-xs text-slate-400">{repoInfo.full_name} • {healthResult.overallScore}/100</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/40 rounded-xl text-left transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <FileText className="w-5 h-5 text-cyan-400" />
              {copiedMd && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-cyan-300">
              {copiedMd ? 'Copied to Clipboard!' : 'Copy Markdown'}
            </div>
            <p className="text-[11px] text-slate-400">Perfect for GitHub issues or PR reviews</p>
          </button>

          <button
            onClick={handleDownloadJson}
            className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/40 rounded-xl text-left transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-emerald-300">
              Download JSON
            </div>
            <p className="text-[11px] text-slate-400">Raw telemetry for pipelines and archiving</p>
          </button>

          <button
            onClick={handlePrint}
            className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/40 rounded-xl text-left transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Printer className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-indigo-300">
              Print / Save PDF
            </div>
            <p className="text-[11px] text-slate-400">Formatted executive summary document</p>
          </button>
        </div>

        {/* Embeddable Markdown Badge */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Embeddable README Badge:</span>
            <button
              onClick={handleCopyBadge}
              className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              {copiedBadge ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <code className="block p-2 bg-slate-950 text-slate-400 text-xs rounded border border-slate-800/80 font-mono truncate">
            {badgeSnippet}
          </code>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
