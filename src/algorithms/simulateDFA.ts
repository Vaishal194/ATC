import { Automaton, SimulationResult, SimulationStep } from '../types/automata';

/**
 * Simulates the execution of a DFA on an input string.
 * Tracks the exact state trajectory step-by-step.
 */
export function simulateDFA(dfa: Automaton, inputString: string): SimulationResult {
  const steps: SimulationStep[] = [];

  const initialState = dfa.states.find((s) => s.isInitial);
  if (!initialState) {
    return {
      input: inputString,
      isAccepted: false,
      steps: [],
      finalActiveStateIds: [],
      reason: 'Automaton Error: No initial state found in DFA.',
    };
  }

  let currentStateId = initialState.id;
  const chars = inputString.split('');

  // Initial step (before reading any input)
  steps.push({
    stepIndex: 0,
    charIndex: -1,
    symbolRead: null,
    remainingString: inputString,
    activeStateIds: [currentStateId],
    activeTransitionIds: [],
    description: `Start at initial state '${initialState.label}'. Input string to consume: "${inputString}".`,
  });

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const remaining = inputString.slice(i + 1);

    // Validate symbol against alphabet
    if (!dfa.alphabet.includes(char)) {
      return {
        input: inputString,
        isAccepted: false,
        steps: steps,
        finalActiveStateIds: [currentStateId],
        reason: `Rejected: Symbol '${char}' is not in the automaton alphabet Σ = {${dfa.alphabet.join(', ')}}.`,
      };
    }

    // Find deterministic transition
    const matchingTransitions = dfa.transitions.filter(
      (t) => t.from === currentStateId && t.symbol === char
    );

    if (matchingTransitions.length === 0) {
      steps.push({
        stepIndex: i + 1,
        charIndex: i,
        symbolRead: char,
        remainingString: remaining,
        activeStateIds: [],
        activeTransitionIds: [],
        description: `No transition defined from state '${currentStateId}' on input symbol '${char}'. DFA halts and rejects.`,
      });

      return {
        input: inputString,
        isAccepted: false,
        steps: steps,
        finalActiveStateIds: [],
        reason: `Rejected: Incomplete DFA. No transition from state '${currentStateId}' on symbol '${char}'.`,
      };
    }

    const transition = matchingTransitions[0];
    const prevStateId = currentStateId;
    currentStateId = transition.to;

    const currentObj = dfa.states.find((s) => s.id === currentStateId);
    const prevObj = dfa.states.find((s) => s.id === prevStateId);

    steps.push({
      stepIndex: i + 1,
      charIndex: i,
      symbolRead: char,
      remainingString: remaining,
      activeStateIds: [currentStateId],
      activeTransitionIds: [transition.id],
      description: `Read '${char}': Transition δ(${prevObj?.label || prevStateId}, '${char}') -> ${currentObj?.label || currentStateId}.`,
    });
  }

  const finalStateObj = dfa.states.find((s) => s.id === currentStateId);
  const isAccepted = !!finalStateObj?.isFinal;

  let reason = '';
  if (isAccepted) {
    reason = `Accepted: Automaton consumed entire input and halted in final (accepting) state '${finalStateObj?.label}'.`;
  } else {
    reason = `Rejected: Automaton consumed entire input but halted in non-accepting state '${finalStateObj?.label}'.`;
  }

  return {
    input: inputString,
    isAccepted,
    steps,
    finalActiveStateIds: [currentStateId],
    reason,
  };
}

