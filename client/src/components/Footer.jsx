import React from 'react';
import { Activity, Github, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070b12] py-10 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Description */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                Code<span className="text-cyan-400">Pulse</span>
              </div>
              <p className="text-slate-500 text-[11px]">Production-quality open-source GitHub Repository Health Monitor</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-slate-400">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center space-x-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">MIT Licensed</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Powered by Groq & Octokit</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <p>© {new Date().getFullYear()} CodePulse. Created with open-source spirit.</p>
          <div className="flex items-center space-x-1 text-slate-500">
            <span>Built for developers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
