import React, { useState, useMemo } from 'react';
import { Automaton, NfaToDfaResult } from '../types/automata';
import { convertNfaToDfa } from '../algorithms/nfaToDfa';
import { StateDiagram } from '../components/StateDiagram';
import { TransitionTable } from '../components/TransitionTable';
import { AutomatonFormInput } from '../components/AutomatonFormInput';
import { EXAMPLE_AUTOMATA } from '../utils/examples';
import { ArrowRightLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const NfaToDfaPage: React.FC = () => {
  const nfaExamples = EXAMPLE_AUTOMATA.filter((ex) => ex.category === 'NFA' || ex.category === 'Epsilon-NFA');
  const [inputNfa, setInputNfa] = useState<Automaton>(
    nfaExamples[0]?.automaton || {
      id: 'custom_nfa',
      name: 'Custom NFA',
      type: 'NFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: true },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: '0' },
        { id: 't2', from: 'q0', to: 'q0', symbol: '1' },
        { id: 't3', from: 'q0', to: 'q1', symbol: '0' },
        { id: 't4', from: 'q1', to: 'q2', symbol: '1' },
      ],
    }
  );

  const [conversionVersion, setConversionVersion] = useState<number>(0);

  const conversionResult: NfaToDfaResult | null = useMemo(() => {
    void conversionVersion;
    try {
      return convertNfaToDfa(inputNfa);
    } catch (err) {
      console.error('NFA to DFA conversion error:', err);
      return null;
    }
  }, [inputNfa, conversionVersion]);

  const handleConvert = () => {
    setConversionVersion((v) => v + 1);
  };

  const outputDfa = conversionResult?.dfa;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Module 2: NFA to DFA Conversion</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert a Non-Deterministic Finite Automaton (NFA, with or without ε-moves) into an equivalent DFA using Subset Construction.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full">
            Rabin-Scott Powerset Algorithm
          </span>
        </div>
      </div>

      {/* 2. Automaton Form Input */}
      <AutomatonFormInput
        mode="NFA"
        automaton={inputNfa}
        onChange={setInputNfa}
        onConvert={handleConvert}
        examples={nfaExamples}
      />

      {/* 3. Conversion Summary Metrics */}
      {conversionResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Input NFA States:</span>
            <span className="text-lg font-bold font-mono text-purple-400">
              {inputNfa.states.length} States
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Theoretical max = 2^{inputNfa.states.length} = {Math.pow(2, inputNfa.states.length)}
            </span>
          </div>

          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Reachable DFA States:</span>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {conversionResult.dfa.states.length} States
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Only reachable subsets generated
            </span>
          </div>

          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Powerset Subsets:</span>
            <span className="text-lg font-bold font-mono text-slate-200">
              {Object.keys(conversionResult.subsetMap).length} Subsets
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              ε-closures computed transitively
            </span>
          </div>

          <div className="bg-dark-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-slate-400 text-xs font-mono block">Dead/Trap State (∅):</span>
            <span
              className={`text-lg font-bold font-mono ${
                conversionResult.hasDeadState ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {conversionResult.hasDeadState ? 'Added (∅)' : 'Not Needed'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {conversionResult.hasDeadState
                ? 'Ensures complete transition function'
                : 'All states have full transitions'}
            </span>
          </div>
        </div>
      )}

      {/* Subset Mapping Table */}
      {conversionResult && (
        <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-4 shadow-md">
          <h3 className="text-xs font-bold text-slate-200 font-mono mb-2">
            Powerset State Correspondence Mapping:
          </h3>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {conversionResult.dfa.states.map((s) => {
              const nfaSet = conversionResult.subsetMap[s.id] || [];
              const formattedSet = nfaSet.length > 0 ? `{${nfaSet.join(', ')}}` : '∅';
              return (
                <div
                  key={s.id}
                  className="bg-dark-950 border border-slate-800 px-3 py-1 rounded-lg flex items-center gap-1.5"
                >
                  <span className="font-bold text-cyan-300">{s.label.split(':')[0]}:</span>
                  <span className="text-slate-300">{formattedSet}</span>
                  {s.isInitial && (
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1 rounded">
                      initial
                    </span>
                  )}
                  {s.isFinal && (
                    <span className="text-[10px] text-purple-400 bg-purple-950 px-1 rounded">
                      final
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Side-by-Side Comparison: BOTH Input NFA and Output DFA Diagrams & Tables */}
      {outputDfa ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Comparison: Input NFA vs. Converted Equivalent DFA</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Both diagrams displayed side-by-side
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Input NFA */}
            <div className="space-y-4 bg-dark-900/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h3 className="text-xs font-bold text-purple-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. Input NFA</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {inputNfa.states.length} States • {inputNfa.transitions.length} Transitions
                </span>
              </div>

              <StateDiagram
                automaton={inputNfa}
                title="Input NFA Diagram"
                typeBadge="NFA"
              />

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  Input NFA Transition Table (with ε Column):
                </span>
                <TransitionTable automaton={inputNfa} />
              </div>
            </div>

            {/* Column 2: Resulting Equivalent DFA */}
            <div className="space-y-4 bg-dark-900/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h3 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. Converted Equivalent DFA</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {outputDfa.states.length} States • {outputDfa.transitions.length} Transitions
                </span>
              </div>

              <StateDiagram
                automaton={outputDfa}
                title="Converted DFA Diagram"
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
      ) : (
        <div className="bg-rose-950/30 border border-rose-500/50 p-6 rounded-xl text-center text-rose-300 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>Unable to convert NFA. Please ensure an initial state is defined in the input.</span>
        </div>
      )}
    </div>
  );
};
