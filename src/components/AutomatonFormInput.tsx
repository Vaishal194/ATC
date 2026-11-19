import React, { useState } from 'react';
import { Automaton, AutomatonState, AutomatonTransition, EPSILON } from '../types/automata';
import { ExampleAutomaton } from '../utils/examples';
import { Plus, Trash2, ArrowRight, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface AutomatonFormInputProps {
  mode: 'DFA' | 'NFA';
  automaton: Automaton;
  onChange: (automaton: Automaton) => void;
  onConvert: () => void;
  examples: ExampleAutomaton[];
  title?: string;
}

export const AutomatonFormInput: React.FC<AutomatonFormInputProps> = ({
  mode,
  automaton,
  onChange,
  onConvert,
  examples,
}) => {
  // Local state strings for easy user editing
  const [statesInput, setStatesInput] = useState<string>(
    automaton.states.map((s) => s.label).join(', ')
  );
  const [alphabetInput, setAlphabetInput] = useState<string>(
    automaton.alphabet.filter((s) => s !== EPSILON).join(', ')
  );
  const [initialStateInput, setInitialStateInput] = useState<string>(
    automaton.states.find((s) => s.isInitial)?.label || (automaton.states[0]?.label ?? 'q0')
  );
  const [finalStatesInput, setFinalStatesInput] = useState<string>(
    automaton.states.filter((s) => s.isFinal).map((s) => s.label).join(', ')
  );

  // Sync inputs when automaton changes externally (e.g. loading an example)
  React.useEffect(() => {
    setStatesInput(automaton.states.map((s) => s.label).join(', '));
    setAlphabetInput(automaton.alphabet.filter((s) => s !== EPSILON).join(', '));
    setInitialStateInput(
      automaton.states.find((s) => s.isInitial)?.label || (automaton.states[0]?.label ?? 'q0')
    );
    setFinalStatesInput(
      automaton.states.filter((s) => s.isFinal).map((s) => s.label).join(', ')
    );
  }, [automaton]);

  // Parse state labels from comma-separated input
  const parsedStateNames = statesInput
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Parse alphabet symbols
  const parsedAlphabet = alphabetInput
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== EPSILON);

  // Parse final state names
  const parsedFinalNames = finalStatesInput
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Compute validation errors
  const errors: string[] = [];
  if (parsedStateNames.length === 0) {
    errors.push('At least one state must be defined.');
  }
  if (parsedAlphabet.length === 0) {
    errors.push('Alphabet must contain at least one symbol.');
  }
  if (parsedStateNames.length > 0 && !parsedStateNames.includes(initialStateInput)) {
    errors.push(`Initial state "${initialStateInput}" is not in the list of states.`);
  }
  for (const f of parsedFinalNames) {
    if (!parsedStateNames.includes(f)) {
      errors.push(`Final state "${f}" is not in the list of states.`);
      break;
    }
  }

  // Check DFA constraints if in DFA mode
  if (mode === 'DFA') {
    const dfaTransMap = new Map<string, number>();
    for (const t of automaton.transitions) {
      if (t.symbol === EPSILON || t.symbol === 'eps' || t.symbol === 'ε') {
        errors.push('A DFA cannot contain epsilon (ε) transitions.');
        break;
      }
      const key = `${t.from}-${t.symbol}`;
      const count = (dfaTransMap.get(key) || 0) + 1;
      dfaTransMap.set(key, count);
      if (count > 1) {
        errors.push(`DFA cannot have multiple transitions from state "${t.from}" on symbol "${t.symbol}".`);
        break;
      }
    }
  }

  // Helper to commit changes to the parent automaton object
  const applyFormChanges = (
    newStatesList: string[],
    newAlphabet: string[],
    newInitial: string,
    newFinals: string[],
    currentTransitions: AutomatonTransition[]
  ) => {
    // Generate states
    const states: AutomatonState[] = newStatesList.map((label) => {
      const existing = automaton.states.find((s) => s.label === label);
      return {
        id: existing?.id || label,
        label: label,
        isInitial: label === newInitial,
        isFinal: newFinals.includes(label),
        x: existing?.x,
        y: existing?.y,
      };
    });

    // Ensure valid transitions
    const validTransitions = currentTransitions.filter(
      (t) => newStatesList.includes(t.from) && newStatesList.includes(t.to)
    );

    const updated: Automaton = {
      ...automaton,
      alphabet: mode === 'NFA' ? Array.from(new Set([...newAlphabet, EPSILON])) : newAlphabet,
      states,
      transitions: validTransitions,
    };
    onChange(updated);
  };

  const handleStatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStatesInput(val);
    const parsed = val.split(',').map((s) => s.trim()).filter(Boolean);
    let newInit = initialStateInput;
    if (parsed.length > 0 && !parsed.includes(newInit)) {
      newInit = parsed[0];
      setInitialStateInput(newInit);
    }
    applyFormChanges(parsed, parsedAlphabet, newInit, parsedFinalNames, automaton.transitions);
  };

  const handleAlphabetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAlphabetInput(val);
    const parsed = val.split(',').map((s) => s.trim()).filter((s) => s && s !== EPSILON);
    applyFormChanges(parsedStateNames, parsed, initialStateInput, parsedFinalNames, automaton.transitions);
  };

  const handleInitialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setInitialStateInput(val);
    applyFormChanges(parsedStateNames, parsedAlphabet, val, parsedFinalNames, automaton.transitions);
  };

  const handleFinalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFinalStatesInput(val);
    const parsed = val.split(',').map((s) => s.trim()).filter(Boolean);
    applyFormChanges(parsedStateNames, parsedAlphabet, initialStateInput, parsed, automaton.transitions);
  };

  // Add a new transition
  const handleAddTransition = () => {
    if (parsedStateNames.length === 0) return;
    const from = parsedStateNames[0];
    const to = parsedStateNames[0];
    const symbol = parsedAlphabet[0] || (mode === 'NFA' ? EPSILON : '0');
    const newTrans: AutomatonTransition = {
      id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      from,
      to,
      symbol,
    };
    const updatedTransitions = [...automaton.transitions, newTrans];
    onChange({
      ...automaton,
      transitions: updatedTransitions,
    });
  };

  // Update existing transition
  const handleUpdateTransition = (
    id: string,
    field: 'from' | 'symbol' | 'to',
    value: string
  ) => {
    const updated = automaton.transitions.map((t) => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    });
    onChange({
      ...automaton,
      transitions: updated,
    });
  };

  // Delete a transition
  const handleDeleteTransition = (id: string) => {
    const updated = automaton.transitions.filter((t) => t.id !== id);
    onChange({
      ...automaton,
      transitions: updated,
    });
  };

  // Load a preset example
  const handleLoadExample = (ex: ExampleAutomaton) => {
    onChange(JSON.parse(JSON.stringify(ex.automaton)));
  };

  // Reset to default
  const handleReset = () => {
    if (examples.length > 0) {
      handleLoadExample(examples[0]);
    }
  };

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* 1. Header with Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Input {mode} Definition</span>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                mode === 'DFA'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              }`}
            >
              {mode} Mode
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define your automaton below or click a sample preset for an instant test.
          </p>
        </div>

        {/* Example Presets Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Presets:</span>
          </span>
          {examples.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleLoadExample(ex)}
              className="px-2.5 py-1 text-xs bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-cyan-300 border border-slate-700/80 rounded-md transition-all font-mono"
            >
              {ex.title.replace(`${mode}: `, '')}
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

      {/* 2. Structured Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* States input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>States (Q)</span>
            <span className="text-[10px] text-slate-500 font-mono">comma-separated</span>
          </label>
          <input
            type="text"
            value={statesInput}
            onChange={handleStatesChange}
            placeholder="e.g. q0, q1, q2"
            className="w-full bg-dark-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Alphabet input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Alphabet (Σ)</span>
            <span className="text-[10px] text-slate-500 font-mono">comma-separated</span>
          </label>
          <input
            type="text"
            value={alphabetInput}
            onChange={handleAlphabetChange}
            placeholder="e.g. 0, 1"
            className="w-full bg-dark-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Initial state selector */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Initial State (q₀)</span>
            <span className="text-[10px] text-slate-500 font-mono">start state</span>
          </label>
          <select
            value={initialStateInput}
            onChange={handleInitialChange}
            className="w-full bg-dark-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            {parsedStateNames.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Final states input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Final / Accept States (F)</span>
            <span className="text-[10px] text-slate-500 font-mono">comma-separated</span>
          </label>
          <input
            type="text"
            value={finalStatesInput}
            onChange={handleFinalsChange}
            placeholder="e.g. q1, q2"
            className="w-full bg-dark-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm font-mono text-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* 3. Transitions Editor */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span>Transition Relations (δ: Q × Σ → {mode === 'DFA' ? 'Q' : '𝒫(Q)'})</span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({automaton.transitions.length} transitions)
            </span>
          </label>
          <button
            onClick={handleAddTransition}
            disabled={parsedStateNames.length === 0}
            className="px-2.5 py-1 bg-dark-800 hover:bg-dark-750 disabled:opacity-50 text-cyan-400 hover:text-cyan-300 border border-slate-700 rounded-md text-xs font-medium flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transition</span>
          </button>
        </div>

        {/* Transitions List */}
        <div className="bg-dark-950/70 border border-slate-800 rounded-lg p-3 max-h-56 overflow-y-auto space-y-2">
          {automaton.transitions.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500 italic">
              No transitions added yet. Click &quot;Add Transition&quot; above to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {automaton.transitions.map((t) => (
                <div
                  key={t.id}
                  className="bg-dark-900 border border-slate-800/90 rounded-md p-2 flex items-center justify-between gap-1.5"
                >
                  <div className="flex items-center gap-1.5 font-mono text-xs flex-1">
                    {/* From state selector */}
                    <select
                      value={t.from}
                      onChange={(e) => handleUpdateTransition(t.id, 'from', e.target.value)}
                      className="bg-dark-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200 focus:outline-none text-xs"
                    >
                      {parsedStateNames.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <span className="text-slate-500 font-bold">─</span>

                    {/* Symbol selector */}
                    <select
                      value={t.symbol}
                      onChange={(e) => handleUpdateTransition(t.id, 'symbol', e.target.value)}
                      className="bg-dark-950 border border-slate-700 rounded px-1.5 py-1 text-cyan-300 font-bold focus:outline-none text-xs"
                    >
                      {parsedAlphabet.map((sym) => (
                        <option key={sym} value={sym}>
                          {sym}
                        </option>
                      ))}
                      {mode === 'NFA' && <option value={EPSILON}>ε</option>}
                    </select>

                    <span className="text-slate-500 font-bold">→</span>

                    {/* To state selector */}
                    <select
                      value={t.to}
                      onChange={(e) => handleUpdateTransition(t.id, 'to', e.target.value)}
                      className="bg-dark-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200 focus:outline-none text-xs"
                    >
                      {parsedStateNames.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteTransition(t.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-dark-800 transition-colors"
                    title="Delete transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Validation Errors Display */}
      {errors.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-lg p-3 text-xs text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold block">Input Validation Error:</span>
            <ul className="list-disc list-inside mt-0.5 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 5. Convert Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-400 font-mono">
          Ready to compute {mode === 'DFA' ? 'DFA → NFA embedding' : 'NFA → DFA subset construction'}
        </span>
        <button
          onClick={onConvert}
          disabled={errors.length > 0}
          className={`px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
            errors.length > 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : mode === 'DFA'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-900/40'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/40'
          }`}
        >
          <span>Convert to {mode === 'DFA' ? 'NFA' : 'DFA'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
