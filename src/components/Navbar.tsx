import React from 'react';
import { AppPage } from './Sidebar';
import { Menu, Sparkles, Layers, ArrowRightLeft, Code, GitFork } from 'lucide-react';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onToggleMobileMenu,
}) => {
  const getPageTitle = (page: AppPage) => {
    switch (page) {
      case 'home':
        return 'Overview';
      case 'dfa-to-nfa':
        return 'Module 1: DFA to NFA';
      case 'nfa-to-dfa':
        return 'Module 2: NFA to DFA';
      case 'regex-to-dfa':
        return 'Module 3: Regex to DFA';
      case 'regex-to-nfa':
        return 'Module 4: Regex to ε-NFA';
      default:
        return 'Automata Studio';
    }
  };

  return (
    <header className="h-16 bg-dark-900/90 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      {/* Left: Mobile hamburger & Active Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-300"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="font-bold text-sm text-white">
            {getPageTitle(currentPage)}
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded">
            Simple Conversion Tool
          </span>
        </div>
      </div>

      {/* Right: Quick Module Switchers */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('dfa-to-nfa')}
          title="DFA to NFA"
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
            currentPage === 'dfa-to-nfa'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-dark-850 text-slate-400 border-slate-700/80 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>DFA → NFA</span>
        </button>

        <button
          onClick={() => onNavigate('nfa-to-dfa')}
          title="NFA to DFA"
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
            currentPage === 'nfa-to-dfa'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-dark-850 text-slate-400 border-slate-700/80 hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>NFA → DFA</span>
        </button>

        <button
          onClick={() => onNavigate('regex-to-dfa')}
          title="Regex to DFA"
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
            currentPage === 'regex-to-dfa'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-dark-850 text-slate-400 border-slate-700/80 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Regex → DFA</span>
        </button>

        <button
          onClick={() => onNavigate('regex-to-nfa')}
          title="Regex to ε-NFA"
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
            currentPage === 'regex-to-nfa'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-dark-850 text-slate-400 border-slate-700/80 hover:text-slate-200'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Regex → ε-NFA</span>
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-200 hover:text-cyan-300 border border-slate-700 text-xs font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Home</span>
        </button>
      </div>
    </header>
  );
};
