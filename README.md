<div align="center">

# ⚡ CodePulse
### GitHub Repository Health & Risk Monitor

*Production-grade open-source web application for analyzing repository health, detecting exposed secrets, measuring issue/PR velocity, visualizing commit activity, and generating AI-powered maintenance blueprints.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B%20%7C%2022%2B-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TailwindCSS-06B6D4)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-6366F1)](https://expressjs.com/)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Groq%20%7C%20Llama%203.3%2070B-10B981)](https://groq.com/)
[![CI](https://github.com/your-username/CodePulse/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/CodePulse/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-key-features) • [Quickstart](#-quickstart) • [Scoring Rubric](#-100-point-health-scoring-rubric) • [Architecture](#-architecture) • [API Config](#-environment-variables) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**CodePulse** audits public GitHub repositories by combining real-time telemetry from the GitHub REST API with an intelligent scoring engine and Groq's ultra-fast LLM inference (`llama-3.3-70b-versatile`). Maintainers, engineering leads, open-source contributors, and security auditors can evaluate codebase health at a glance.

```
       ┌────────────────────────┐
       │ Public GitHub Repo URL │
       └───────────┬────────────┘
                   │
         [ GitHub REST API ]
                   │
    ┌──────────────┴─────────────────────────┐
    │  • Tree & Files      • Commit Velocity │
    │  • Issues & PRs      • Package Manifest│
    │  • README Content    • Security Check  │
    └──────────────┬─────────────────────────┘
                   │
         [ 6-Pillar Scorer ]
                   │
    ┌──────────────┴─────────────────────────┐
    │ 1. Documentation & Community   (20%)   │
    │ 2. Maintenance & Cadence       (20%)   │
    │ 3. Issue & PR Management       (18%)   │
    │ 4. Code Quality & Testing      (16%)   │
    │ 5. Security Posture            (14%)   │
    │ 6. Dependency Hygiene          (12%)   │
    └──────────────┬─────────────────────────┘
                   │
         [ Groq AI Synthesis ]
                   │
 ┌─────────────────▼──────────────────────────┐
 │  • Health Score (0-100) & Grade (A+ to F)  │
 │  • Exposed Secrets & Vulnerability Alerts │
 │  • Interactive Commit Activity AreaChart   │
 │  • Prioritized AI Action Blueprint + Code  │
 │  • Side-by-Side Repository Comparison     │
 └────────────────────────────────────────────┘
```

---

## 🚀 Key Features

1. **Composite Health Score (0 to 100):** Weighted multi-dimensional rubric with letter grades (**A+**, **A**, **B**, **C**, **D**, **F**) and interactive 6-pillar radar charts.
2. **Code Quality & Architecture Indicators:** Detects automated CI/CD pipelines (`.github/workflows`, CircleCI, Travis), test directories (Jest, Vitest, Pytest, Go test), linter configs (ESLint, Prettier, Biome, Ruff), and branch health.
3. **README & Documentation Analysis:** Evaluates structural completeness (Installation, Usage, Contributing, License, Badges), reading time, word count, and readability index.
4. **Issue & PR Velocity Metrics:** Calculates issue close rates, median resolution turnaround time (in days), PR merge velocity, and flags stale issues (>60 days inactive).
5. **Commit Activity Visualization:** Interactive gradient AreaChart showing weekly commit velocity, 30-day commit volume, last commit recency, and top contributor breakdowns with avatars.
6. **Dependency & Outdated Package Analysis:** Parses `package.json`, `requirements.txt`, `Cargo.toml`, and `go.mod`. Verifies lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Cargo.lock`) and flags unpinned or bloated dependencies.
7. **Security Risk Indicators for Leaked Secrets:** Scans tree files for accidentally committed secrets (`.env`, `.pem`, `id_rsa`, `credentials.json`, `*.key`), checks `.gitignore`, and verifies `SECURITY.md` vulnerability reporting channels.
8. **AI-Generated Recommendations via Groq:** High-speed synthesis using Groq's `llama-3.3-70b-versatile` generating prioritized, categorized improvements with copy-pasteable code fixes (GitHub Actions workflows, Dependabot YAML, `.gitignore` entries). Includes an intelligent offline fallback engine.
9. **Premium Dark Developer Dashboard:** Polished dark mode UI with modern typography (`Inter`, `JetBrains Mono`), glowing visual accents, confetti celebrations on top scores, and mobile responsiveness.
10. **Head-to-Head Repository Comparison:** Side-by-side comparison of any two repositories with winning metric badges, comparative radar charts, and differential breakdowns.
11. **One-Click Demo Repositories:** Instant pre-cached analysis for popular repositories (`facebook/react`, `expressjs/express`, `vercel/next.js`, `tailwindlabs/tailwindcss`) without hitting GitHub rate limits.
12. **Multi-Format Report Export:** Download JSON telemetry, print formatted PDF reports, or copy Markdown summaries directly into GitHub issues or pull requests.

---

## 📊 100-Point Health Scoring Rubric

The composite health score is calculated across six weighted pillars:

| Pillar | Weight | Key Evaluation Criteria |
| :--- | :---: | :--- |
| **1. Documentation & Community** | **20%** | Comprehensive README (+8), OSI-approved License (+3), Description & Topics (+4), CONTRIBUTING, CODE_OF_CONDUCT & Issue/PR templates (+5). |
| **2. Maintenance Cadence** | **20%** | Last commit recency (<7d = +8, <30d = +6, <90d = +4), 4-week commit velocity (+6), formal releases/tags (+4), non-archived status (+2). |
| **3. Issue & PR Management** | **18%** | Issue close rate (>80% = +7), PR merge turnaround rate (>70% = +6), low stale issues ratio (+5). |
| **4. Code Quality & Architecture**| **16%** | Automated CI/CD workflows (+6), automated test suite (+5), code linters/formatters (+3), modular codebase structure (+2). |
| **5. Security Posture** | **14%** | Zero exposed sensitive files (+7, up to -35 penalty if `.env` or keys leaked!), `SECURITY.md` policy (+4), Dependabot/Renovate scanning (+3). |
| **6. Dependency Hygiene** | **12%** | Deterministic lockfile presence (+4), version pinning without loose wildcards (+4), sustainable package footprint (+4). |

### Grade Scale

- **A+ (90 – 100):** *Exceptional* – Exemplary open-source standard with comprehensive test suites, active maintainers, and pristine security.
- **A (80 – 89):** *Healthy & Maintained* – Strong documentation, active cadence, and healthy issue turnaround.
- **B (70 – 79):** *Good Posture* – Stable codebase with opportunities to expand automated CI or documentation.
- **C (55 – 69):** *Needs Attention* – Backlog of stale issues, missing test suites, or outdated documentation.
- **D (40 – 54):** *At Risk* – Infrequent commits, missing licenses, or potential secret exposure risks.
- **F (< 40):** *Critical Neglect* – Archived, unmaintained, or serious exposed credentials.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts, Canvas-Confetti
- **Backend:** Node.js (ESM), Express 4, `@octokit/rest`, Axios, In-Memory TTL Cache
- **AI Engine:** Groq SDK (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with automatic heuristic fallback
- **CI/CD:** GitHub Actions (Node 18, 20, 22 matrix)

---

## ⚡ Quickstart

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/CodePulse.git
   cd CodePulse
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables:**
   ```bash
   cp server/.env.example server/.env
   ```

4. **Start local development servers:**
   ```bash
   npm run dev
   ```
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🔑 Environment Variables

Create a `server/.env` file based on `server/.env.example`:

```ini
# Server Port
PORT=5000

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# GitHub Personal Access Token (Optional but Recommended)
# Increases rate limits from 60 req/hr to 5,000 req/hr.
# Requires only public_repo read permissions.
GITHUB_TOKEN=

# Groq API Key (Optional but Recommended for Live AI Suggestions)
# Free key available at: https://console.groq.com/keys
# If left empty, CodePulse automatically runs its built-in rule engine!
GROQ_API_KEY=

# Groq Model
GROQ_MODEL=llama-3.3-70b-versatile

# Cache TTL (in milliseconds - default: 15 min)
CACHE_TTL_MS=900000
```

> [!NOTE]
> **API Key Safety:** Users can also supply their own optional GitHub Token or Groq API key directly in the web dashboard's **API Configuration modal**. Keys are stored exclusively in the browser's `localStorage` and never saved to any database.

---

## 🧪 Testing & Verification

Run the automated test suite:

```bash
# Run backend test runner (health scorer, security scanner, dependency parser, readme analyzer)
npm run test --prefix server

# Build client production bundle
npm run build --prefix client
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, branch conventions, and PR guidelines. All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### 🌱 Good First Issues

Looking for an easy way to contribute? Check out our curated beginner tasks:
- **`#1`**: Add support for `pyproject.toml` and `requirements-dev.txt` in the dependency analyzer.
- **`#2`**: Add embeddable SVG repository health score badge endpoint (`/api/badge/:owner/:repo`).
- **`#3`**: Add CSV export option in the health report modal.
- **`#4`**: Support Composer (`composer.json`) and Ruby (`Gemfile`) dependency parsing.
- **`#5`**: Add Dockerfile and `docker-compose.yml` for containerized deployment.

Automate creating these issues on your GitHub repository with:
```bash
GITHUB_TOKEN=your_token node scripts/create-issues.js your-username/CodePulse
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
