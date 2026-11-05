import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSave }) {
  const [githubToken, setGithubToken] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGithubToken(localStorage.getItem('codepulse_github_token') || '');
      setGroqKey(localStorage.getItem('codepulse_groq_key') || '');
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (githubToken.trim()) {
      localStorage.setItem('codepulse_github_token', githubToken.trim());
    } else {
      localStorage.removeItem('codepulse_github_token');
    }

    if (groqKey.trim()) {
      localStorage.setItem('codepulse_groq_key', groqKey.trim());
    } else {
      localStorage.removeItem('codepulse_groq_key');
    }

    setSavedSuccess(true);
    setTimeout(() => {
      onSave?.();
      onClose();
    }, 600);
  };

  const handleClear = () => {
    localStorage.removeItem('codepulse_github_token');
    localStorage.removeItem('codepulse_groq_key');
    setGithubToken('');
    setGroqKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      onSave?.();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">API Configuration</h3>
              <p className="text-xs text-slate-400">All keys are stored locally in your browser and never saved on our database.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="flex items-center p-3 mb-4 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Check className="w-4 h-4 mr-2" />
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* GitHub Token */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-200">
              GitHub Personal Access Token <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
            />
            <p className="mt-1 text-xs text-slate-400">
              Increases GitHub API limit from 60 to <strong>5,000 requests/hr</strong>. Only needs read-only public repo scope.
            </p>
          </div>

          {/* Groq API Key */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-200">
              Groq API Key <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
            />
            <p className="mt-1 text-xs text-slate-400">
              Enables live Llama-3.3-70b synthesis for AI recommendations. If omitted, CodePulse uses its built-in rule engine.
            </p>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-start space-x-2.5 text-xs text-slate-300">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong>Client-Side Storage:</strong> Keys are kept only in your local browser storage (<code className="text-cyan-300">localStorage</code>) and are forwarded over encrypted HTTPS only for your active requests.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 transition"
            >
              Clear Keys
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
