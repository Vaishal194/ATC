import React, { useState, useMemo } from 'react';
import { parseRegex } from '../algorithms/regexParser';
import { buildThompsonNfa } from '../algorithms/thompsonConstruction';
import { StateDiagram } from '../components/StateDiagram';
import { TransitionTable } from '../components/TransitionTable';
import { REGEX_EXAMPLES } from '../utils/regexExamples';
import { EPSILON } from '../types/automata';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, GitFork } from 'lucide-react';

export const RegexToEpsNfaPage: React.FC = () => {
  const [regexInput, setRegexInput] = useState<string>('(a|b)*abb');
  const [conversionTrigger, setConversionTrigger] = useState<number>(0);

  // Validate regex syntax
  const parseResult = useMemo(() => {
    return parseRegex(regexInput);
  }, [regexInput]);

  // Compute Thompson Construction
  const { thompsonResult, error } = useMemo(() => {
    void conversionTrigger;
    if (!parseResult.isValid) {
      return { thompsonResult: null, error: parseResult.error };
    }
    try {
      const res = buildThompsonNfa(regexInput);
      return { thompsonResult: res, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thompson construction error';
      return { thompsonResult: null, error: msg };
    }
  }, [regexInput, parseResult, conversionTrigger]);

  const outputNfa = thompsonResult?.nfa;

  const handleInsertSymbol = (sym: string) => {
    setRegexInput((prev) => prev + sym);
  };

  const handleLoadExample = (exRegex: string) => {
    setRegexInput(exRegex);
  };

  const handleConvert = () => {
    setConversionTrigger((c) => c + 1);
  };

  const handleReset = () => {
    setRegexInput('(a|b)*abb');
  };

  // Epsilon transition count
  const epsilonCount = outputNfa
    ? outputNfa.transitions.filter((t) => t.symbol === EPSILON || t.symbol === 'ε').length
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Module 4: Regular Expression to ε-NFA</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert a Regular Expression into an equivalent Epsilon Non-Deterministic Finite Automaton using Thompson&apos;s Construction.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full">
            Thompson&apos;s Construction Algorithm
          </span>
        </div>
      </div>

      {/* 2. Regex Input Card */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        {/* Presets Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preset Expressions:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {REGEX_EXAMPLES.slice(0, 6).map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleLoadExample(ex.regex)}
                className="px-2.5 py-1 text-xs bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-cyan-300 border border-slate-700/80 rounded-md transition-all font-mono"
              >
                {ex.regex}
              </button>
            ))}
            <button
              onClick={handleReset}
              title="Reset"
              className="p-1 text-slate-400 hover:text-slate-200 bg-dark-850 hover:bg-dark-800 border border-slate-700 rounded-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input Field & Operator Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Regular Expression Input</span>
            <span className="text-[10px] text-slate-500 font-mono">
              Syntax: | (Union), * (Kleene Star), ab (Implicit Concat), ε (Empty String)
            </span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={regexInput}
              onChange={(e) => setRegexInput(e.target.value)}
              placeholder="e.g. (a|b)*abb"
              className="flex-1 bg-dark-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleConvert}
              disabled={!parseResult.isValid}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all shrink-0"
            >
              <span>Convert to ε-NFA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick symbol insertion helper pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs font-mono">
            <span className="text-slate-500 text-[11px] mr-1">Insert:</span>
            {['|', '*', '(', ')', 'ε', 'a', 'b', '0', '1'].map((sym) => (
              <button
                key={sym}
                onClick={() => handleInsertSymbol(sym)}
                className="px-2 py-0.5 bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-purple-300 border border-slate-700/80 rounded transition-colors"
              >
                {sym}
              </button>
            ))}
            <button
              onClick={() => setRegexInput('')}
              className="px-2 py-0.5 bg-dark-850 hover:bg-dark-800 text-rose-400 border border-slate-700 rounded transition-colors ml-auto text-[11px]"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Validation Errors */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/50 rounded-lg p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 3. Thompson Construction Stats */}
      {outputNfa && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Total States:</span>
            <span className="text-lg font-bold font-mono text-purple-400">
              {outputNfa.states.length} States
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Strictly 1 start &amp; 1 accept state
            </span>
          </div>

          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Alphabet (Σ):</span>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {'{' + parseResult.alphabet.join(', ') + '}'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Without epsilon (ε)
            </span>
          </div>

          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Epsilon (ε) Transitions:</span>
            <span className="text-lg font-bold font-mono text-slate-200">
              {epsilonCount} ε-moves
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Zero-cost branching &amp; loops
            </span>
          </div>

          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Total Transitions:</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {outputNfa.transitions.length} Transitions
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Alphabet &amp; ε relations combined
            </span>
          </div>
        </div>
      )}

      {/* 4. Output Section: Diagram & Transition Table */}
      {outputNfa && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Resulting Epsilon-NFA</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {outputNfa.states.length} States • {outputNfa.transitions.length} Transitions
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* State Diagram */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 font-mono">
                Output ε-NFA State Diagram
              </h3>
              <StateDiagram
                automaton={outputNfa}
                title={`ε-NFA for ${regexInput}`}
                typeBadge="NFA"
              />
            </div>

            {/* Transition Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 font-mono">
                Output ε-NFA Transition Table (with ε Column)
              </h3>
              <TransitionTable automaton={outputNfa} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
