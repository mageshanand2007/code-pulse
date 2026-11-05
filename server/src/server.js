import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import {
  analyzeRepository,
  getRateLimit,
  getPresets,
  clearCache,
} from './controllers/analyzeController.js';
import { compareRepositories } from './controllers/compareController.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CodePulse API',
    version: '1.0.0',
    uptime: process.uptime(),
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    githubTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.get('/api/analyze', analyzeRepository);
app.post('/api/analyze', analyzeRepository);
app.post('/api/compare', compareRepositories);
app.get('/api/presets', getPresets);
app.get('/api/rate-limit', getRateLimit);
app.post('/api/cache/clear', clearCache);

// Serve client production build if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 CodePulse Backend running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Groq API: ${process.env.GROQ_API_KEY ? 'Active (Live AI)' : 'Unset (Fallback Engine Active)'}`);
  console.log(`🐙 GitHub Token: ${process.env.GITHUB_TOKEN ? 'Authenticated (5,000 req/hr)' : 'Unauthenticated (60 req/hr)'}`);
  console.log(`===============================================`);
});

export default app;
