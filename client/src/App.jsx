import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import DashboardPage from './pages/DashboardPage';
import ComparePage from './pages/ComparePage';
import DocsPage from './pages/DocsPage';
import { analyzeRepository, fetchRateLimit } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimit, setRateLimit] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentRepo, setCurrentRepo] = useState('facebook/react');

  // Load initial demo repo and rate limit on mount
  useEffect(() => {
    loadRateLimit();
    handleSearch('facebook/react');
  }, []);

  const loadRateLimit = async () => {
    try {
      const limitInfo = await fetchRateLimit();
      if (limitInfo) setRateLimit(limitInfo);
    } catch {}
  };

  const handleSearch = async (repoInput, forceFresh = false) => {
    if (!repoInput) return;
    setIsLoading(true);
    setError(null);
    setCurrentRepo(repoInput);

    try {
      const result = await analyzeRepository(repoInput, forceFresh);
      setReportData(result.data);
      loadRateLimit();
    } catch (err) {
      setError(err.message || 'Failed to analyze repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (currentRepo) {
      handleSearch(currentRepo, true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 bg-grid-pattern selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        rateLimit={rateLimit}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardPage
            reportData={reportData}
            isLoading={isLoading}
            error={error}
            onSearch={handleSearch}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === 'compare' && <ComparePage />}

        {activeTab === 'rubric' && <DocsPage />}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => {
          loadRateLimit();
          handleRefresh();
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
