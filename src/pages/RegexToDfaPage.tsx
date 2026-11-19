import React, { useState, useMemo } from 'react';
import { parseRegex } from '../algorithms/regexParser';
import { buildThompsonNfa } from '../algorithms/thompsonConstruction';
import { convertNfaToDfa } from '../algorithms/nfaToDfa';
import { StateDiagram } from '../components/StateDiagram';
import { TransitionTable } from '../components/TransitionTable';
import { REGEX_EXAMPLES } from '../utils/regexExamples';
import { Code, ArrowRight, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export const RegexToDfaPage: React.FC = () => {
  const [regexInput, setRegexInput] = useState<string>('(a|b)*abb');
  const [conversionTrigger, setConversionTrigger] = useState<number>(0);

  // Validate regex syntax
  const parseResult = useMemo(() => {
    return parseRegex(regexInput);
  }, [regexInput]);

  // Compute Thompson NFA and then Subset Construction DFA
  const { intermediateNfa, dfaResult, error } = useMemo(() => {
    void conversionTrigger;
    if (!parseResult.isValid) {
      return { intermediateNfa: null, dfaResult: null, error: parseResult.error };
    }
    try {
      const thompson = buildThompsonNfa(regexInput);
      const dfaRes = convertNfaToDfa(thompson.nfa);
      return { intermediateNfa: thompson.nfa, dfaResult: dfaRes, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Conversion error';
      return { intermediateNfa: null, dfaResult: null, error: msg };
    }
  }, [regexInput, parseResult, conversionTrigger]);

  const outputDfa = dfaResult?.dfa;

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Module 3: Regular Expression to DFA</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert a Regular Expression directly into a Deterministic Finite Automaton (Regex → ε-NFA → DFA).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
            Thompson &amp; Powerset Construction
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
              Precedence: * (Star) &gt; . (Concat) &gt; | (Union)
            </span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={regexInput}
              onChange={(e) => setRegexInput(e.target.value)}
              placeholder="e.g. (a|b)*abb"
              className="flex-1 bg-dark-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              onClick={handleConvert}
              disabled={!parseResult.isValid}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all shrink-0"
            >
              <span>Convert to DFA</span>
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
                className="px-2 py-0.5 bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-cyan-300 border border-slate-700/80 rounded transition-colors"
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

      {/* 3. Conversion Pipeline Summary Cards */}
      {dfaResult && intermediateNfa && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Input Alphabet (Σ):</span>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {'{' + parseResult.alphabet.join(', ') + '}'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Extracted from expression
            </span>
          </div>

          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Intermediate ε-NFA:</span>
            <span className="text-lg font-bold font-mono text-purple-400">
              {intermediateNfa.states.length} States
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Thompson inductive construction
            </span>
          </div>

          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Resulting DFA States:</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {outputDfa?.states.length} States
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Reachable subsets evaluated
            </span>
          </div>

          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Dead/Trap State (∅):</span>
            <span
              className={`text-lg font-bold font-mono ${
                dfaResult.hasDeadState ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              {dfaResult.hasDeadState ? 'Added (∅)' : 'Not Needed'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {dfaResult.hasDeadState ? 'Complete transition function' : 'All states fully defined'}
            </span>
          </div>
        </div>
      )}

      {/* 4. Side-by-Side Comparison: BOTH Intermediate Thompson ε-NFA and Output DFA Diagrams & Tables */}
      {outputDfa && intermediateNfa && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Comparison: Intermediate Thompson ε-NFA vs. Resulting DFA</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Both diagrams displayed side-by-side
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Intermediate Thompson ε-NFA */}
            <div className="space-y-4 bg-dark-900/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h3 className="text-xs font-bold text-purple-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. Intermediate Thompson ε-NFA</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {intermediateNfa.states.length} States • {intermediateNfa.transitions.length} Transitions
                </span>
              </div>

              <StateDiagram
                automaton={intermediateNfa}
                title={`Thompson ε-NFA for ${regexInput}`}
                typeBadge="NFA"
              />

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  Intermediate ε-NFA Transition Table:
                </span>
                <TransitionTable automaton={intermediateNfa} />
              </div>
            </div>

            {/* Column 2: Resulting Equivalent DFA */}
            <div className="space-y-4 bg-dark-900/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. Converted Equivalent DFA</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {outputDfa.states.length} States • {outputDfa.transitions.length} Transitions
                </span>
              </div>

              <StateDiagram
                automaton={outputDfa}
                title={`Converted DFA for ${regexInput}`}
                typeBadge="DFA"
              />

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  Resulting DFA Transition Table (Deterministic):
                </span>
                <TransitionTable automaton={outputDfa} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
