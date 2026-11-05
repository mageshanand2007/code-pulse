/**
 * README Analyzer Service
 * Evaluates documentation quality, readability, structure, and essential sections.
 */

export function analyzeReadme(readmeContent = '') {
  if (!readmeContent || typeof readmeContent !== 'string') {
    return {
      present: false,
      score: 0,
      wordCount: 0,
      charCount: 0,
      headingCount: 0,
      codeBlockCount: 0,
      badgeCount: 0,
      sections: {},
      missingSections: [
        'Title & Description',
        'Installation Guide',
        'Usage Instructions',
        'Features Overview',
        'Contributing Guidelines',
        'License Information',
      ],
      readabilityGrade: 'Missing',
      summary: 'No README.md found in repository root.',
    };
  }

  const content = readmeContent;
  const lower = content.toLowerCase();

  // Metrics
  const charCount = content.length;
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lines = content.split('\n');

  // Markdown parsing heuristics
  const headingMatches = content.match(/^#{1,6}\s+.+$/gm) || [];
  const headingCount = headingMatches.length;

  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  const codeBlockCount = codeBlocks.length;

  // Badges detection: ![...](...) or shields.io / badge / workflow badge
  const badgeMatches = content.match(/!\[.*?\]\(.*?(?:shields\.io|badge|actions\/workflows|travis-ci|circleci|coveralls|codecov).*?\)/gi) || [];
  const badgeCount = badgeMatches.length;

  // Key section detection
  const sectionDetectors = {
    title: /^#\s+[^\n]+/m.test(content) || headingCount > 0,
    installation: /##?\s*(?:installation|getting started|setup|install|prerequisites)/i.test(content) || /npm (?:install|i)|pip install|cargo add|yarn add|pnpm add|go get/i.test(content),
    usage: /##?\s*(?:usage|how to use|quick\s*start|example|api)/i.test(content) || codeBlockCount > 0,
    features: /##?\s*(?:features|highlights|what(?:'s| is) inside|overview)/i.test(content),
    contributing: /##?\s*(?:contributing|development|how to contribute)/i.test(content) || /contributing\.md/i.test(content),
    license: /##?\s*license/i.test(content) || /licensed under/i.test(content) || /mit license|apache license|gpl/i.test(content),
    badges: badgeCount > 0,
  };

  const detectedSections = [];
  const missingSections = [];

  if (sectionDetectors.title) detectedSections.push('Title & Overview');
  else missingSections.push('Title & Overview');

  if (sectionDetectors.installation) detectedSections.push('Installation Guide');
  else missingSections.push('Installation Guide');

  if (sectionDetectors.usage) detectedSections.push('Usage & Examples');
  else missingSections.push('Usage & Examples');

  if (sectionDetectors.features) detectedSections.push('Features');
  else missingSections.push('Features Overview');

  if (sectionDetectors.contributing) detectedSections.push('Contributing Guidelines');
  else missingSections.push('Contributing Guidelines');

  if (sectionDetectors.license) detectedSections.push('License Notice');
  else missingSections.push('License Information');

  if (sectionDetectors.badges) detectedSections.push('Status Badges');

  // Compute Readme Score (0 - 100)
  let score = 0;

  // Length factor (up to 25 pts)
  if (wordCount >= 400) score += 25;
  else if (wordCount >= 200) score += 18;
  else if (wordCount >= 100) score += 12;
  else if (wordCount >= 30) score += 6;
  else score += 2;

  // Structure factor: headings (up to 20 pts)
  if (headingCount >= 6) score += 20;
  else if (headingCount >= 4) score += 15;
  else if (headingCount >= 2) score += 10;
  else if (headingCount >= 1) score += 5;

  // Code snippets factor (up to 15 pts)
  if (codeBlockCount >= 3) score += 15;
  else if (codeBlockCount >= 1) score += 10;

  // Sections presence (up to 30 pts: 5 pts each)
  if (sectionDetectors.title) score += 5;
  if (sectionDetectors.installation) score += 5;
  if (sectionDetectors.usage) score += 5;
  if (sectionDetectors.features) score += 5;
  if (sectionDetectors.contributing) score += 5;
  if (sectionDetectors.license) score += 5;

  // Badges bonus (up to 10 pts)
  if (badgeCount >= 3) score += 10;
  else if (badgeCount >= 1) score += 5;

  score = Math.min(100, Math.max(0, score));

  // Determine readability grade
  let readabilityGrade = 'Poor';
  if (score >= 85) readabilityGrade = 'Excellent';
  else if (score >= 70) readabilityGrade = 'Good';
  else if (score >= 50) readabilityGrade = 'Fair';

  return {
    present: true,
    score,
    wordCount,
    charCount,
    lineCount: lines.length,
    headingCount,
    codeBlockCount,
    badgeCount,
    sections: sectionDetectors,
    detectedSections,
    missingSections,
    readabilityGrade,
    estimatedReadTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
  };
}

export default analyzeReadme;
