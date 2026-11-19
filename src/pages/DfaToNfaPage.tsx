import React, { useState, useMemo } from 'react';
import { Automaton } from '../types/automata';
import { convertDfaToNfa } from '../algorithms/dfaToNfa';
import { StateDiagram } from '../components/StateDiagram';
import { TransitionTable } from '../components/TransitionTable';
import { AutomatonFormInput } from '../components/AutomatonFormInput';
import { EXAMPLE_AUTOMATA } from '../utils/examples';
import { Layers, Info, CheckCircle2 } from 'lucide-react';

export const DfaToNfaPage: React.FC = () => {
  const dfaExamples = EXAMPLE_AUTOMATA.filter((ex) => ex.category === 'DFA');
  const [inputDfa, setInputDfa] = useState<Automaton>(
    dfaExamples[0]?.automaton || {
      id: 'custom_dfa',
      name: 'Custom DFA',
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: '0' },
        { id: 't2', from: 'q0', to: 'q1', symbol: '1' },
        { id: 't3', from: 'q1', to: 'q1', symbol: '0' },
        { id: 't4', from: 'q1', to: 'q0', symbol: '1' },
      ],
    }
  );

  const [conversionVersion, setConversionVersion] = useState<number>(0);

  const conversionResult = useMemo(() => {
    void conversionVersion;
    return convertDfaToNfa(inputDfa);
  }, [inputDfa, conversionVersion]);

  const handleConvert = () => {
    setConversionVersion((v) => v + 1);
  };

  const outputNfa = conversionResult.nfa;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Module 1: DFA to NFA Conversion</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert a Deterministic Finite Automaton (DFA) into an equivalent Non-Deterministic Finite Automaton (NFA).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">
            DFA ⊆ NFA (Special Case)
          </span>
        </div>
      </div>

      {/* 2. Automaton Form Input */}
      <AutomatonFormInput
        mode="DFA"
        automaton={inputDfa}
        onChange={setInputDfa}
        onConvert={handleConvert}
        examples={dfaExamples}
      />

      {/* 3. Mathematical Theory Info */}
      <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-slate-200 block">
              Formal Theory: DFA as a Special Case of NFA
            </span>
            <p className="text-slate-400 leading-relaxed">
              Every DFA M = (Q, Σ, δ, q0, F) is already an NFA M&apos; = (Q, Σ, δ&apos;, q0, F) where each deterministic transition δ(q, a) = p is represented as a singleton set δ&apos;(q, a) = &#123;p&#125;. States, alphabet, initial state, and final states remain identical.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Side-by-Side Comparison: BOTH Input DFA and Output NFA Diagrams & Tables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Comparison: Input DFA vs. Converted Equivalent NFA</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Both diagrams displayed side-by-side
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Input DFA */}
          <div className="space-y-4 bg-dark-900/40 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h3 className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Input DFA</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {inputDfa.states.length} States • {inputDfa.transitions.length} Transitions
              </span>
            </div>

            <StateDiagram
              automaton={inputDfa}
              title="Input DFA Diagram"
              typeBadge="DFA"
            />

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 font-mono">
                Input DFA Transition Table (Deterministic):
              </span>
              <TransitionTable automaton={inputDfa} />
            </div>
          </div>

          {/* Column 2: Resulting Equivalent NFA */}
          <div className="space-y-4 bg-dark-900/40 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h3 className="text-xs font-bold text-purple-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>2. Converted Equivalent NFA</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {outputNfa.states.length} States • {outputNfa.transitions.length} Transitions
              </span>
            </div>

            <StateDiagram
              automaton={outputNfa}
              title="Equivalent NFA Diagram"
              typeBadge="NFA"
            />

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 font-mono">
                Resulting NFA Transition Table (Singleton Sets):
              </span>
              <TransitionTable automaton={outputNfa} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
