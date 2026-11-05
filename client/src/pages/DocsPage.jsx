import React from 'react';
import { BookOpen, Shield, Cpu, Award, Key, CheckCircle, Flame, Layers } from 'lucide-react';

export default function DocsPage() {
  const pillars = [
    {
      title: 'Documentation & Community Health',
      weight: '20% of Score (20 Points Max)',
      color: 'text-emerald-400',
      description: 'First impressions and contributor onboarding determine repository sustainability.',
      criteria: [
        'README Quality: Clear overview, installation, usage code snippets, and badges (+8 pts)',
        'Open Source License: Standard OSI-approved license detected (+3 pts)',
        'Repository Metadata: Clear description, website link, and topic tags (+4 pts)',
        'Community Guidelines: CONTRIBUTING.md, CODE_OF_CONDUCT.md, and Issue/PR templates (+5 pts)',
      ],
    },
    {
      title: 'Maintenance & Activity Cadence',
      weight: '20% of Score (20 Points Max)',
      color: 'text-cyan-400',
      description: 'Measures development velocity and maintainer responsiveness.',
      criteria: [
        'Last Commit Recency: <7 days (+8 pts), <30 days (+6 pts), <90 days (+4 pts)',
        'Commit Frequency: Velocity across the last 4 weeks (+6 pts)',
        'Formal Release Cadence: Tagged semantic versions and releases (+4 pts)',
        'Non-archived repository status (+2 pts)',
      ],
    },
    {
      title: 'Issue & PR Management Velocity',
      weight: '18% of Score (18 Points Max)',
      color: 'text-indigo-400',
      description: 'Evaluates maintainer turnaround time for community bug reports and pull requests.',
      criteria: [
        'Issue Close Rate: >80% (+7 pts), >60% (+5 pts), >40% (+3 pts)',
        'Pull Request Merge Velocity: >70% (+6 pts), >50% (+4 pts), >30% (+2 pts)',
        'Stale Issues Penalty: Backlog of issues inactive >60 days penalizes score (+5 pts down to +1 pt)',
      ],
    },
    {
      title: 'Code Quality & Testing Infrastructure',
      weight: '16% of Score (16 Points Max)',
      color: 'text-violet-400',
      description: 'Checks for automated safety nets that prevent software regressions.',
      criteria: [
        'Automated CI/CD Workflows: GitHub Actions, CircleCI, or Travis (+6 pts)',
        'Test Suite: Dedicated test directory or configs (Jest, Vitest, Pytest, Go test) (+5 pts)',
        'Code Linters & Formatting: ESLint, Prettier, Biome, or Ruff configs (+3 pts)',
        'Architectural Directory Structure (+2 pts)',
      ],
    },
    {
      title: 'Security & Secret Risk Posture',
      weight: '14% of Score (14 Points Max)',
      color: 'text-rose-400',
      description: 'Scans for accidental credentials leaks and responsible disclosure policies.',
      criteria: [
        'Exposed Files: Committed .env, .pem, id_rsa, or credentials (-35 to -15 pts penalty)',
        'SECURITY.md: Vulnerability disclosure policy present (+4 pts)',
        'Automated Vulnerability Scanning: Dependabot or Renovate config (+3 pts)',
        '.gitignore configured to prevent local secret leaks (+7 pts)',
      ],
    },
    {
      title: 'Dependency Health & Hygiene',
      weight: '12% of Score (12 Points Max)',
      color: 'text-amber-400',
      description: 'Audits supply chain reproducibility and package footprint.',
      criteria: [
        'Deterministic Lockfile: package-lock.json, yarn.lock, pnpm-lock.yaml, Cargo.lock (+4 pts)',
        'Version Pinning: Lack of wildcard/unpinned dependencies (+4 pts)',
        'Dependency Footprint: Direct dependencies within sustainable range (+4 pts)',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pt-4">
      {/* Title */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Documentation & Methodology</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Scoring Rubric & Architecture</h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Understand how CodePulse computes the 100-point Health Score and how to configure custom API keys.
        </p>
      </div>

      {/* Grade Scale Reference */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Grading Scale & Health Classification</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-xl font-bold text-emerald-400">A+</div>
            <div className="text-slate-300 font-medium mt-1">90 - 100</div>
            <div className="text-[10px] text-slate-400">Exceptional</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="text-xl font-bold text-cyan-400">A</div>
            <div className="text-slate-300 font-medium mt-1">80 - 89</div>
            <div className="text-[10px] text-slate-400">Healthy</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
            <div className="text-xl font-bold text-indigo-400">B</div>
            <div className="text-slate-300 font-medium mt-1">70 - 79</div>
            <div className="text-[10px] text-slate-400">Good</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-xl font-bold text-amber-400">C</div>
            <div className="text-slate-300 font-medium mt-1">55 - 69</div>
            <div className="text-[10px] text-slate-400">Needs Attention</div>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <div className="text-xl font-bold text-orange-400">D</div>
            <div className="text-slate-300 font-medium mt-1">40 - 54</div>
            <div className="text-[10px] text-slate-400">At Risk</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div className="text-xl font-bold text-rose-400">F</div>
            <div className="text-slate-300 font-medium mt-1">&lt; 40</div>
            <div className="text-[10px] text-slate-400">Critical Neglect</div>
          </div>
        </div>
      </div>

      {/* 6 Pillars Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">The 6 Core Scoring Pillars</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((p, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-bold ${p.color}`}>{p.title}</h4>
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                {p.weight}
              </div>
              <p className="text-xs text-slate-300">{p.description}</p>
              <ul className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                {p.criteria.map((c, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* API Configuration Guide */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Key className="w-5 h-5 text-cyan-400" />
          <span>API Configuration & Limits</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          <div>
            <strong className="text-white block text-sm">GitHub Personal Access Token:</strong>
            <p className="text-slate-400 mt-0.5">
              Unauthenticated GitHub requests are capped by GitHub at 60 requests per hour per IP. Adding a Personal Access Token (classic or fine-grained with <code className="text-cyan-300">public_repo</code> read-only permission) lifts this limit to <strong>5,000 requests/hr</strong>.
            </p>
          </div>

          <div>
            <strong className="text-white block text-sm">Groq API Key (AI Recommendations):</strong>
            <p className="text-slate-400 mt-0.5">
              CodePulse connects to Groq's high-speed LPU inference engine running <code className="text-cyan-300">llama-3.3-70b-versatile</code> to synthesize customized suggestions and generate ready-to-copy code snippets. If you don't provide a Groq key, CodePulse automatically runs its built-in heuristic recommendations engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
