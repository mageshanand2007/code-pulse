<div align="center">

# ⚡ CodePulse
### GitHub Repository Health & Risk Monitor

*A full-stack dashboard for exploring public GitHub repository health, understanding six transparent scoring pillars, and finding practical maintenance improvements.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B%20%7C%2022%2B-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TailwindCSS-06B6D4)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-6366F1)](https://expressjs.com/)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Groq%20%7C%20Llama%203.3%2070B-10B981)](https://groq.com/)
[![CI](https://github.com/mageshanand2007/CodePulse/actions/workflows/ci.yml/badge.svg)](https://github.com/mageshanand2007/CodePulse/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-key-features) • [Quickstart](#-quickstart) • [Scoring Rubric](#-100-point-health-scoring-rubric) • [Architecture](#-architecture) • [API Config](#-environment-variables) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**CodePulse** turns public GitHub repository metadata into an explainable health report. Search for a repository to review its documentation, activity, issues and pull requests, code-quality signals, security-related file indicators, and dependency configuration in one dashboard.

The React frontend communicates with an Express API. The API gathers repository data from GitHub, calculates a 0–100 score across six weighted pillars, and can generate recommendations with Groq. If no Groq key is configured—or the request fails—the backend uses its built-in rule-based recommendation engine. No database is required: GitHub responses are cached in process memory for 15 minutes.

> **Scope note:** CodePulse analyzes public GitHub metadata and repository file paths using heuristics. Its security indicators are not a full secret scan, vulnerability audit, or substitute for a dedicated security tool. GitHub metrics may be based on limited samples and should be interpreted accordingly.

## 🏗 Architecture

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

1. **Explainable six-pillar health score:** Review the 0–100 score, grade, normalized pillar scores, weighted point contributions, criterion progress bars, deductions, and improvement suggestions.
2. **Documentation signals:** Checks README structure and quality, repository description and topics, license metadata, and community contribution files.
3. **Maintenance and activity:** Summarizes recent commits, commit activity, releases where available, and repository archive status.
4. **Issue and pull request metrics:** Shows close/merge rates, issue resolution time, open counts, and stale-item estimates from the fetched sample.
5. **Code-quality indicators:** Looks for CI configuration, test files/configuration, linter configuration, and repository tree size.
6. **Security-related indicators:** Flags selected sensitive-looking file names, checks for `.gitignore` and `SECURITY.md`, and detects Dependabot/Renovate configuration. This is path-based heuristic analysis, not content scanning.
7. **Dependency overview:** Recognizes selected manifests and lockfiles, reports dependency counts and loose versions where supported, and estimates dependency hygiene.
8. **AI recommendations:** Uses Groq when configured and otherwise provides rule-based recommendations. Suggestions may include example configuration snippets.
9. **Repository comparison:** Compares two repositories side-by-side across the same six pillars.
10. **Demo repositories and exports:** Provides built-in demo data for `facebook/react`, `expressjs/express`, and `vercel/next.js`; export reports as JSON, Markdown, or print-to-PDF.

---

## 📊 100-Point Health Scoring Rubric

The composite health score is calculated across six weighted pillars:

| Pillar | Weight | Key Evaluation Criteria |
| :--- | :---: | :--- |
| **1. Documentation & Community** | **20%** | README quality, repository description and topics, license, contributor guidance, Code of Conduct, and issue/PR templates. |
| **2. Maintenance & Activity** | **20%** | Last-commit recency, recent commit volume, release metadata, and non-archived status. |
| **3. Issues & PR Velocity** | **18%** | Issue close rate, PR merge rate, and stale-item ratio. |
| **4. Code Quality & Testing** | **16%** | CI configuration, test indicators, linter/formatter configuration, and repository structure. |
| **5. Security Posture** | **14%** | Sensitive-looking file paths, `.gitignore`, `SECURITY.md`, and Dependabot/Renovate configuration. |
| **6. Dependency Hygiene** | **12%** | Lockfile presence, version specifications, and direct dependency footprint. |

Pillar contributions are added together to form the composite score. The dashboard also shows each pillar as a normalized percentage and its weighted contribution in points. Exact checks and point allocations are maintained in `server/src/services/healthScorer.js`; the figures may differ from an independent assessment because GitHub data is sampled and some signals are heuristic.

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
   git clone https://github.com/mageshanand2007/CodePulse.git
   cd CodePulse
   ```

2. **Install root, server, and client dependencies:**
   ```bash
   npm run install:all
   ```

3. **Optionally configure API credentials:** Copy `server/.env.example` to `server/.env` and add a GitHub token and/or Groq key. Both services can run without these keys; unauthenticated GitHub requests have a lower rate limit, and AI suggestions use the fallback engine without a Groq key.

4. **Start local development servers:**
   ```bash
   npm run dev
   ```
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **Backend health check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

The Vite development server proxies `/api` requests to the backend. You can also start the production API with `npm start` from the repository root; to serve the built frontend through Express, build it first with `npm run build`.

### Windows PowerShell setup

```powershell
git clone https://github.com/mageshanand2007/CodePulse.git
Set-Location CodePulse
npm run install:all
Copy-Item server/.env.example server/.env # Optional: edit this file to add API keys
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 🔑 Environment Variables

Create a `server/.env` file based on `server/.env.example`:

```ini
# Server Port
PORT=5000

# Client URL — reserved for a production CORS allow-list.
# Note: the server currently accepts all origins (`cors({ origin: true })`),
# so this value is not read yet.
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

# Cache TTL in milliseconds (currently informational; the in-memory cache uses a fixed 15-minute TTL).
CACHE_TTL_MS=900000
```

> [!NOTE]
> **API key handling:** You may configure keys in `server/.env` or enter them in the dashboard's API Configuration modal. Dashboard-entered keys are stored in that browser's `localStorage` and sent to the backend with requests; they are not stored in a CodePulse database. Use HTTPS when deploying the application and only enter keys into a server you trust.

## 🧭 Using CodePulse

### Analyze a repository

1. Open the dashboard and enter a public GitHub repository as `owner/repo` or as a GitHub URL (for example, `facebook/react`).
2. Select **Analyze**. The report includes repository metadata, the composite health score, six-pillar breakdown, activity, issue/PR metrics, documentation, code-quality indicators, security signals, dependencies, and recommendations.
3. Select **Refresh** to request fresh GitHub data rather than using the cached result.
4. Use **Export Report** to copy Markdown, download JSON, or print/save the report as a PDF.

The built-in demo repositories can be selected from the dashboard without a live GitHub fetch. Demo reports are example snapshots, not a guarantee of current repository metrics.

### Compare repositories

Select **Compare Repos**, enter two repositories (for example, `facebook/react` and `vercel/next.js`), and run the comparison. The page displays the overall winner, score difference, and side-by-side pillar scores.

### Call the API

Analyze a repository:

```bash
curl "http://localhost:5000/api/analyze?repo=facebook%2Freact"
```

Compare two repositories:

```bash
curl -X POST "http://localhost:5000/api/compare" \
  -H "Content-Type: application/json" \
  -d "{\"repo1\":\"facebook/react\",\"repo2\":\"vercel/next.js\"}"
```

Other useful endpoints include `GET /api/health`, `GET /api/presets`, and `GET /api/rate-limit`. For an authenticated GitHub API request, send the optional `x-github-token` header. The dashboard's saved GitHub token is sent automatically.

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
GITHUB_TOKEN=your_token node scripts/create-issues.js mageshanand2007/CodePulse
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
