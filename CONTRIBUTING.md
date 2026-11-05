# Contributing to CodePulse

Thank you for your interest in contributing to **CodePulse**! We welcome all contributions, from bug reports and documentation fixes to major feature proposals and new health metrics.

---

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it to understand the standards of behavior we expect in our community.

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**
- *(Optional)* GitHub Personal Access Token (for higher API rate limits)
- *(Optional)* Groq API Key (for live AI recommendations)

### Local Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/CodePulse.git
   cd CodePulse
   ```

2. **Install all dependencies across root, server, and client:**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables:**
   ```bash
   cp server/.env.example server/.env
   ```
   Add your optional `GITHUB_TOKEN` and `GROQ_API_KEY` in `server/.env`.

4. **Start the development servers:**
   ```bash
   npm run dev
   ```
   - Frontend runs at: `http://localhost:5173`
   - Backend API runs at: `http://localhost:5000`

---

## Where to Start: Good First Issues

We maintain a curated set of issues labeled [`good first issue`](https://github.com/your-username/CodePulse/labels/good%20first%20issue). These are self-contained tasks designed to help newcomers familiarize themselves with the codebase:
- Adding support for new package manifest parsers (e.g. `composer.json`, `mix.exs`, `pubspec.yaml`).
- Adding new documentation quality heuristic checks.
- Adding additional export formats (CSV, SVG badge generators).
- Improving UI accessibility (ARIA attributes, keyboard navigation).

---

## Branching & Commit Conventions

- Create a descriptive feature branch:
  ```bash
  git checkout -b feature/add-cargo-lock-scanner
  # or
  git checkout -b fix/issue-resolution-calculation
  ```
- Use Conventional Commits format:
  - `feat: add poetry.lock dependency parser`
  - `fix: handle 404 when repository has no releases`
  - `docs: update API setup instructions in README`
  - `refactor: optimize commit activity aggregation`
  - `test: add unit test for health score calculation`

---

## Pull Request Checklist

Before opening a pull request, please make sure you:
- [ ] Run `npm run build` in `client/` to verify frontend builds cleanly without warnings.
- [ ] Run `npm run test` in `server/` to verify backend tests pass.
- [ ] Test the feature locally with multiple repositories (small, large, monorepos).
- [ ] Keep pull requests focused on a single concern.
- [ ] Update documentation where relevant.

---

## License

By contributing to CodePulse, you agree that your contributions will be licensed under the [MIT License](LICENSE).
