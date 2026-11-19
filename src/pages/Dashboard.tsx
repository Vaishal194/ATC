import React from 'react';
import { AppPage } from '../components/Sidebar';
import {
  Layers,
  ArrowRightLeft,
  Code,
  GitFork,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: AppPage) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const conversionCards = [
    {
      id: 'dfa-to-nfa' as AppPage,
      title: '1. DFA to NFA',
      badge: 'Embedding',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      description:
        'Convert a Deterministic Finite Automaton (DFA) into an equivalent NFA. Demonstrates how every DFA is a special case of an NFA with singleton transition sets.',
      icon: Layers,
      accentColor: 'from-blue-600 to-indigo-600',
      hoverBorder: 'hover:border-blue-500/50',
    },
    {
      id: 'nfa-to-dfa' as AppPage,
      title: '2. NFA to DFA',
      badge: 'Subset Construction',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      description:
        'Convert a Non-Deterministic Finite Automaton (with multiple branchings and ε-transitions) into an equivalent DFA using Rabin-Scott Powerset Construction.',
      icon: ArrowRightLeft,
      accentColor: 'from-cyan-600 to-blue-600',
      hoverBorder: 'hover:border-cyan-500/50',
    },
    {
      id: 'regex-to-dfa' as AppPage,
      title: '3. Regular Expression to DFA',
      badge: 'Regex → ε-NFA → DFA',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description:
        'Parse a regular expression and convert it directly into an equivalent DFA via Thompson\'s Construction followed by Subset Construction.',
      icon: Code,
      accentColor: 'from-emerald-600 to-teal-600',
      hoverBorder: 'hover:border-emerald-500/50',
    },
    {
      id: 'regex-to-nfa' as AppPage,
      title: '4. Regular Expression to ε-NFA',
      badge: 'Thompson\'s Algorithm',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      description:
        'Convert a regular expression into an equivalent Epsilon-NFA using Thompson\'s inductive structural construction rules.',
      icon: GitFork,
      accentColor: 'from-purple-600 to-indigo-600',
      hoverBorder: 'hover:border-purple-500/50',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. Clean Title & Subtitle Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-slate-800 p-8 md:p-10 overflow-hidden shadow-2xl text-center">
        {/* Subtle Ambient glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Formal Languages &amp; Automata Theory</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Automata Studio
          </h1>

          <p className="text-base md:text-lg text-slate-300 font-medium">
            A Simple Finite Automata Conversion Tool
          </p>

          <p className="text-xs md:text-sm text-slate-400 leading-relaxed pt-1">
            Demonstrating the four fundamental automata conversions with interactive state diagrams and generated transition tables.
          </p>
        </div>
      </div>

      {/* 2. Four Clear Conversion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {conversionCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className={`group bg-dark-900 border border-slate-800 ${card.hoverBorder} rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${card.accentColor} text-white shadow-lg`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {card.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                  Open Converter
                </span>
                <div className="p-1.5 rounded-lg bg-dark-800 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 transition-all">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
