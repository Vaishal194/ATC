import React from 'react';
import { Automaton, EPSILON } from '../types/automata';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TransitionTableProps {
  automaton: Automaton;
  onCellClick?: (stateId: string, symbol: string) => void;
  className?: string;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({
  automaton,
  onCellClick,
  className = '',
}) => {
  const isDFA = automaton.type === 'DFA';
  const cleanAlphabet = automaton.alphabet.filter(
    (s) => s !== 'ε' && s !== 'E' && s !== 'eps' && s !== 'e'
  );

  const hasEpsilon =
    automaton.type === 'NFA' ||
    automaton.transitions.some(
      (t) => t.symbol === EPSILON || t.symbol === 'E' || t.symbol === 'eps' || t.symbol === 'e'
    );

  const columns = [...cleanAlphabet];
  if (hasEpsilon) {
    columns.push(EPSILON);
  }

  // Get destination(s) for a given state and symbol
  const getDestinations = (stateId: string, symbol: string): string[] => {
    let matching: string[] = [];
    if (symbol === EPSILON) {
      matching = automaton.transitions
        .filter(
          (t) =>
            t.from === stateId &&
            (t.symbol === EPSILON || t.symbol === 'E' || t.symbol === 'eps' || t.symbol === 'e')
        )
        .map((t) => t.to);
    } else {
      matching = automaton.transitions
        .filter((t) => t.from === stateId && t.symbol === symbol)
        .map((t) => t.to);
    }

    return Array.from(new Set(matching)).sort();
  };

  return (
    <div className={`flex flex-col bg-dark-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-lg ${className}`}>
      {/* Header bar */}
      <div className="bg-dark-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 text-sm">
            Transition Table (δ)
          </span>
          <span className="text-xs font-mono text-slate-400 bg-dark-800 px-2 py-0.5 rounded border border-slate-700/60">
            {isDFA ? 'δ: Q × Σ → Q' : 'δ: Q × (Σ ∪ {ε}) → 𝒫(Q)'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-cyan-400 font-mono">
            <span className="font-bold">→</span> Initial
          </span>
          <span className="flex items-center gap-1 text-purple-400 font-mono">
            <span className="font-bold">*</span> Final
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-dark-850/60 text-slate-300 font-mono text-xs border-b border-slate-800">
              <th className="py-3 px-4 font-semibold border-r border-slate-800 w-44">
                State (q ∈ Q)
              </th>
              {columns.map((sym) => (
                <th
                  key={sym}
                  className={`py-3 px-4 font-semibold text-center ${
                    sym === EPSILON ? 'text-purple-300 bg-purple-950/20' : 'text-cyan-300'
                  }`}
                >
                  Input '{sym}'
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {automaton.states.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-8 text-center text-slate-500 italic"
                >
                  No states defined. Add states to view the transition table.
                </td>
              </tr>
            ) : (
              automaton.states.map((state) => {
                const isInitial = state.isInitial;
                const isFinal = state.isFinal;

                return (
                  <tr
                    key={state.id}
                    className="hover:bg-dark-800/40 transition-colors group"
                  >
                    {/* State column */}
                    <td className="py-2.5 px-4 font-bold border-r border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 text-cyan-400 text-sm">
                          {isInitial ? '→' : ''}
                        </span>
                        <span className="w-4 text-purple-400 text-sm">
                          {isFinal ? '*' : ''}
                        </span>
                        <span className="text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {state.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isInitial && (
                          <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-1 rounded">
                            start
                          </span>
                        )}
                        {isFinal && (
                          <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800 px-1 rounded">
                            accept
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Columns for each symbol */}
                    {columns.map((sym) => {
                      const destinations = getDestinations(state.id, sym);
                      const destLabels = destinations.map(
                        (id) => automaton.states.find((s) => s.id === id)?.label || id
                      );

                      // Missing transition check for DFA
                      const isMissingDFA = isDFA && destinations.length === 0 && sym !== EPSILON;
                      const isMultiDFA = isDFA && destinations.length > 1;

                      return (
                        <td
                          key={sym}
                          onClick={() => onCellClick?.(state.id, sym)}
                          className={`py-2.5 px-4 text-center cursor-pointer transition-colors ${
                            isMissingDFA
                              ? 'bg-amber-950/20 text-amber-400 hover:bg-amber-950/40'
                              : isMultiDFA
                              ? 'bg-rose-950/20 text-rose-400 hover:bg-rose-950/40'
                              : 'text-slate-300 hover:bg-dark-700/50'
                          }`}
                        >
                          {isDFA ? (
                            destinations.length === 1 ? (
                              <span className="font-semibold text-slate-100">
                                {destLabels[0]}
                              </span>
                            ) : destinations.length === 0 ? (
                              <span className="text-amber-400/80 text-[11px] flex items-center justify-center gap-1 italic">
                                <AlertCircle className="w-3 h-3" /> — (undefined)
                              </span>
                            ) : (
                              <span className="text-rose-400 text-[11px] font-bold">
                                Error ({destLabels.join(', ')})
                              </span>
                            )
                          ) : (
                            // NFA set notation: {q0, q1} or ∅
                            destinations.length > 0 ? (
                              <span className="text-purple-300 font-semibold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                                {'{ ' + destLabels.join(', ') + ' }'}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-serif">∅</span>
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer warning if DFA is incomplete */}
      {isDFA && (
        <div className="bg-dark-950/70 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            {automaton.states.some((s) =>
              cleanAlphabet.some((sym) => getDestinations(s.id, sym).length !== 1)
            ) ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Incomplete DFA: Some transitions are undefined.
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete DFA: Every state has exactly one destination per symbol.
              </span>
            )}
          </div>
          <span className="text-slate-500 text-[11px]">
            Total Transitions: {automaton.transitions.length}
          </span>
        </div>
      )}
    </div>
  );
};

