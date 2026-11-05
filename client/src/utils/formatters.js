/**
 * Formatter Utilities
 */

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
}

export function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return dateString;
  }
}

export function getGradeBadge(grade) {
  switch (grade) {
    case 'A+':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-glow-emerald',
      };
    case 'A':
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        glow: 'shadow-glow-cyan',
      };
    case 'B':
      return {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        glow: 'shadow-glow-indigo',
      };
    case 'C':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-glow-amber',
      };
    case 'D':
    case 'F':
    default:
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        glow: 'shadow-glow-rose',
      };
  }
}

export function getRiskBadge(riskLevel) {
  switch (riskLevel) {
    case 'LOW':
      return {
        label: 'Low Risk',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    case 'MODERATE':
      return {
        label: 'Moderate Risk',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      };
    case 'HIGH':
      return {
        label: 'High Risk',
        bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      };
    case 'CRITICAL':
    default:
      return {
        label: 'Critical Risk',
        bg: 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse',
      };
  }
}
