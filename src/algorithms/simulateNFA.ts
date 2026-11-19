import { Automaton, SimulationResult, SimulationStep } from '../types/automata';
import { computeEpsilonClosure } from './epsilonClosure';

/**
 * Simulates the execution of an NFA (including ε-transitions) on an input string.
 * Concurrently tracks the entire set of active states and epsilon closures at every step.
 */
export function simulateNFA(nfa: Automaton, inputString: string): SimulationResult {
  const steps: SimulationStep[] = [];

  const initialState = nfa.states.find((s) => s.isInitial);
  if (!initialState) {
    return {
      input: inputString,
      isAccepted: false,
      steps: [],
      finalActiveStateIds: [],
      reason: 'Automaton Error: No initial state found in NFA.',
    };
  }

  // 1. Initial active states = ε-closure({initialState})
  let currentActiveStateIds = computeEpsilonClosure([initialState.id], nfa);

  const getLabelList = (ids: string[]): string => {
    if (ids.length === 0) return '∅ (Dead / Rejected)';
    const labels = ids.map((id) => nfa.states.find((s) => s.id === id)?.label || id);
    return `{${labels.join(', ')}}`;
  };

  // Initial step
  steps.push({
    stepIndex: 0,
    charIndex: -1,
    symbolRead: null,
    remainingString: inputString,
    activeStateIds: [...currentActiveStateIds],
    activeTransitionIds: [],
    description: `Start at initial state '${initialState.label}'. After applying ε-closure, initial active state set is ${getLabelList(
      currentActiveStateIds
    )}.`,
  });

  const chars = inputString.split('');

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const remaining = inputString.slice(i + 1);

    // Validate symbol against alphabet
    if (!nfa.alphabet.includes(char)) {
      return {
        input: inputString,
        isAccepted: false,
        steps: steps,
        finalActiveStateIds: currentActiveStateIds,
        reason: `Rejected: Symbol '${char}' is not in the automaton alphabet Σ = {${nfa.alphabet.join(', ')}}.`,
      };
    }

    if (currentActiveStateIds.length === 0) {
      steps.push({
        stepIndex: i + 1,
        charIndex: i,
        symbolRead: char,
        remainingString: remaining,
        activeStateIds: [],
        activeTransitionIds: [],
        description: `No active states available to process '${char}'. Simulation remains halted in ∅.`,
      });
      continue;
    }

    // Direct moves on char
    const traversedTransitions = nfa.transitions.filter(
      (t) => currentActiveStateIds.includes(t.from) && t.symbol === char
    );

    const directTargets = Array.from(new Set(traversedTransitions.map((t) => t.to)));

    // Epsilon closure of direct moves
    const nextActiveStateIds = computeEpsilonClosure(directTargets, nfa);

    currentActiveStateIds = nextActiveStateIds;

    let desc = `Read '${char}': `;
    if (traversedTransitions.length > 0) {
      desc += `Followed ${traversedTransitions.length} transition(s) to ${getLabelList(directTargets)}. `;
      if (nextActiveStateIds.length > directTargets.length) {
        desc += `After ε-closure, active states expand to ${getLabelList(nextActiveStateIds)}.`;
      } else {
        desc += `Active states are now ${getLabelList(nextActiveStateIds)}.`;
      }
    } else {
      desc += `No valid transitions on '${char}' from current active states. State set collapsed to ∅.`;
    }

    steps.push({
      stepIndex: i + 1,
      charIndex: i,
      symbolRead: char,
      remainingString: remaining,
      activeStateIds: [...currentActiveStateIds],
      activeTransitionIds: traversedTransitions.map((t) => t.id),
      description: desc,
    });
  }

  // Acceptance condition: at least one final state is active
  const acceptingActiveStates = currentActiveStateIds.filter(
    (id) => nfa.states.find((s) => s.id === id)?.isFinal
  );
  const isAccepted = acceptingActiveStates.length > 0;

  let reason = '';
  if (isAccepted) {
    const acceptingLabels = acceptingActiveStates
      .map((id) => nfa.states.find((s) => s.id === id)?.label || id)
      .join(', ');
    reason = `Accepted: At end of input, active state set ${getLabelList(
      currentActiveStateIds
    )} contains accepting state(s): {${acceptingLabels}}.`;
  } else {
    if (currentActiveStateIds.length === 0) {
      reason = `Rejected: No paths survived; active state set is empty (∅).`;
    } else {
      reason = `Rejected: None of the active states in ${getLabelList(
        currentActiveStateIds
      )} are accepting states.`;
    }
  }

  return {
    input: inputString,
    isAccepted,
    steps,
    finalActiveStateIds: currentActiveStateIds,
    reason,
  };
}

