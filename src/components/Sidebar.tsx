import React from 'react';
import {
  LayoutDashboard,
  Layers,
  ArrowRightLeft,
  Code,
  GitFork,
  Sparkles,
} from 'lucide-react';

export type AppPage =
  | 'home'
  | 'dfa-to-nfa'
  | 'nfa-to-dfa'
  | 'regex-to-dfa'
  | 'regex-to-nfa';

interface SidebarProps {
  currentPage: AppPage;
  onPageChange: (page: AppPage) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  className = '',
}) => {
  const navItems = [
    {
      id: 'home' as AppPage,
      label: 'Home',
      icon: LayoutDashboard,
      badge: 'Overview',
    },
    {
      id: 'dfa-to-nfa' as AppPage,
      label: '1. DFA to NFA',
      icon: Layers,
      badge: 'Module 1',
    },
    {
      id: 'nfa-to-dfa' as AppPage,
      label: '2. NFA to DFA',
      icon: ArrowRightLeft,
      badge: 'Module 2',
    },
    {
      id: 'regex-to-dfa' as AppPage,
      label: '3. Regex to DFA',
      icon: Code,
      badge: 'Module 3',
    },
    {
      id: 'regex-to-nfa' as AppPage,
      label: '4. Regex to ε-NFA',
      icon: GitFork,
      badge: 'Module 4',
    },
  ];

  return (
    <aside
      className={`w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col justify-between select-none ${className}`}
    >
      <div>
        {/* Brand Header */}
        <div
          onClick={() => onPageChange('home')}
          className="p-5 border-b border-slate-800/80 flex items-center gap-3 cursor-pointer hover:bg-dark-850/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-900/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-400">
              AUTOMATA STUDIO
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Conversion Tool
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Automata Conversions
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-dark-800 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-dark-950/80 rounded-lg p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Automata Studio v2.0</div>
          <div className="text-slate-500">College Theory Project</div>
        </div>
      </div>
    </aside>
  );
};
