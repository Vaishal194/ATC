import React, { useState } from 'react';
import { Sidebar, AppPage } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { DfaToNfaPage } from './pages/DfaToNfaPage';
import { NfaToDfaPage } from './pages/NfaToDfaPage';
import { RegexToDfaPage } from './pages/RegexToDfaPage';
import { RegexToEpsNfaPage } from './pages/RegexToEpsNfaPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-950 text-slate-100 font-sans">
      {/* 1. Desktop Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={handleNavigate}
        className="hidden md:flex h-full shrink-0"
      />

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentPage={currentPage}
          onPageChange={handleNavigate}
          className="h-full shadow-2xl"
        />
      </div>

      {/* 2. Main Application Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-dark-950">
          {currentPage === 'home' && <Dashboard onNavigate={handleNavigate} />}

          {currentPage === 'dfa-to-nfa' && <DfaToNfaPage />}

          {currentPage === 'nfa-to-dfa' && <NfaToDfaPage />}

          {currentPage === 'regex-to-dfa' && <RegexToDfaPage />}

          {currentPage === 'regex-to-nfa' && <RegexToEpsNfaPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
