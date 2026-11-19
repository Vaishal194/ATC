import { Automaton, AutomatonValidationError, AutomatonValidationResult } from '../types/automata';

/**
 * Validates an automaton for mathematical and structural completeness.
 */
export function validateAutomaton(automaton: Automaton): AutomatonValidationResult {
  const errors: AutomatonValidationError[] = [];

  // 1. Check states
  if (!automaton.states || automaton.states.length === 0) {
    errors.push({
      field: 'states',
      message: 'Automaton must have at least one state.',
      severity: 'error',
    });
  }

  // 2. Check initial state
  const initialStates = automaton.states.filter((s) => s.isInitial);
  if (initialStates.length === 0) {
    errors.push({
      field: 'initialState',
      message: 'Automaton must have exactly one initial state. None is currently selected.',
      severity: 'error',
    });
  } else if (initialStates.length > 1) {
    errors.push({
      field: 'initialState',
      message: `Multiple initial states found (${initialStates.map((s) => s.label).join(', ')}). Only one initial state is permitted.`,
      severity: 'error',
    });
  }

  // 3. Check final states
  const finalStates = automaton.states.filter((s) => s.isFinal);
  if (finalStates.length === 0) {
    errors.push({
      field: 'finalStates',
      message: 'No final (accepting) states marked. The automaton will reject all input strings.',
      severity: 'warning',
    });
  }

  // 4. Check alphabet
  if (!automaton.alphabet || automaton.alphabet.length === 0) {
    errors.push({
      field: 'alphabet',
      message: 'Alphabet cannot be empty. Define at least one input symbol (e.g., "0, 1").',
      severity: 'error',
    });
  } else {
    // Check for duplicate alphabet symbols
    const uniqueSymbols = new Set(automaton.alphabet);
    if (uniqueSymbols.size !== automaton.alphabet.length) {
      errors.push({
        field: 'alphabet',
        message: 'Duplicate symbols found in the alphabet.',
        severity: 'warning',
      });
    }
  }

  // 5. Check transitions
  const stateIds = new Set(automaton.states.map((s) => s.id));
  const validSymbols = new Set([...automaton.alphabet, 'ε', 'E', 'eps']);

  automaton.transitions.forEach((t) => {
    if (!stateIds.has(t.from)) {
      errors.push({
        field: 'transitions',
        message: `Transition source '${t.from}' does not exist in the state list.`,
        severity: 'error',
      });
    }
    if (!stateIds.has(t.to)) {
      errors.push({
        field: 'transitions',
        message: `Transition destination '${t.to}' does not exist in the state list.`,
        severity: 'error',
      });
    }
    if (!validSymbols.has(t.symbol)) {
      errors.push({
        field: 'transitions',
        message: `Transition symbol '${t.symbol}' is not part of the defined alphabet {${automaton.alphabet.join(', ')}}.`,
        severity: 'error',
      });
    }
  });

  // 6. DFA specific constraints
  if (automaton.type === 'DFA') {
    // Check for epsilon transitions in DFA
    const epsilonTransitions = automaton.transitions.filter(
      (t) => t.symbol === 'ε' || t.symbol === 'E' || t.symbol === 'eps'
    );
    if (epsilonTransitions.length > 0) {
      errors.push({
        field: 'type',
        message: 'DFAs cannot contain epsilon (ε) transitions. Convert to NFA or remove ε transitions.',
        severity: 'error',
      });
    }

    // Check for non-determinism (multiple transitions on same symbol from same state)
    const seenMap = new Map<string, string[]>();
    for (const t of automaton.transitions) {
      const key = `${t.from}_${t.symbol}`;
      const targets = seenMap.get(key) || [];
      targets.push(t.to);
      seenMap.set(key, targets);
    }

    for (const [key, targets] of seenMap.entries()) {
      if (targets.length > 1) {
        const [fromId, sym] = key.split('_');
        const stateLabel = automaton.states.find((s) => s.id === fromId)?.label || fromId;
        errors.push({
          field: 'transitions',
          message: `DFA Determinism Violation: State '${stateLabel}' has multiple transitions on symbol '${sym}'.`,
          severity: 'error',
        });
      }
    }

    // Check for missing transitions (completeness)
    const missing: string[] = [];
    for (const state of automaton.states) {
      for (const sym of automaton.alphabet) {
        const hasTrans = automaton.transitions.some(
          (t) => t.from === state.id && t.symbol === sym
        );
        if (!hasTrans) {
          missing.push(`δ(${state.label}, '${sym}')`);
        }
      }
    }

    if (missing.length > 0) {
      errors.push({
        field: 'transitions',
        message: `Incomplete DFA: Missing transitions for: ${missing.slice(0, 5).join(', ')}${
          missing.length > 5 ? ` and ${missing.length - 5} more` : ''
        }.`,
        severity: 'warning',
      });
    }
  }

  const isValid = !errors.some((e) => e.severity === 'error');
  return { isValid, errors };
}

