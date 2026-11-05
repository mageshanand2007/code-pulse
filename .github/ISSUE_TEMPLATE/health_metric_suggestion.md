---
name: Health Metric Suggestion
about: Propose a new metric or adjustment to the 100-point Health Score rubric
title: "[METRIC] "
labels: ["metrics", "enhancement", "discussion"]
assignees: ''
---

## Metric Name
*e.g., Code Coverage Badge Detection, Branch Protection Status, Security Advisory Triage Velocity*

## Target Scoring Category
Which pillar should this metric contribute to?
- [ ] Documentation & Community Health
- [ ] Maintenance & Activity Cadence
- [ ] Issue & PR Velocity
- [ ] Code Quality & Architecture
- [ ] Security & Risk Posture
- [ ] Dependency Health

## Weight / Scoring Criteria
How should points be awarded or deducted?
*e.g. 5 points if test coverage badge > 80%, 3 points if badge present, 0 if missing.*

## GitHub API Endpoint(s) Required
List the GitHub REST/GraphQL endpoints needed to extract this data:
*e.g. `/repos/{owner}/{repo}/branches/main/protection`*

## False-Positive Considerations
Could this metric penalize valid repositories (e.g., single-maintainer utilities or archival repos)?
