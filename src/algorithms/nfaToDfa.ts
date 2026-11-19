import {
  Automaton,
  AutomatonState,
  AutomatonTransition,
  NfaToDfaResult,
  SubsetStep,
} from '../types/automata';
import {
  computeEpsilonClosure,
  getDirectMoves,
  getStateSetKey,
} from './epsilonClosure';

/**
 * Converts a Non-Deterministic Finite Automaton (NFA, with or without ε-transitions)
 * to an equivalent Deterministic Finite Automaton (DFA) using the Subset Construction (Powerset) Algorithm.
 */
export function convertNfaToDfa(nfa: Automaton): NfaToDfaResult {
  const steps: SubsetStep[] = [];
  const subsetMap: Record<string, string[]> = {};

  // Find initial state of NFA
  const nfaInitial = nfa.states.find((s) => s.isInitial);
  if (!nfaInitial) {
    throw new Error('NFA has no initial state defined.');
  }

  // 1. Initial DFA state is ε-closure({initialState})
  const initialSubset = computeEpsilonClosure([nfaInitial.id], nfa);
  const initialKey = getStateSetKey(initialSubset);

  // Canonical name mapping: e.g. 0 -> "A", 1 -> "B", etc.
  const stateLetter = (idx: number): string => {
    if (idx < 26) return String.fromCharCode(65 + idx);
    return `S${idx}`;
  };

  const subsetToDfaId = new Map<string, string>();
  const subsetToLabel = new Map<string, string>();
  const subsetToStates = new Map<string, string[]>();

  let stateCounter = 0;
  const initialDfaId = `DFA_${stateCounter}`;
  const initialLabel = stateLetter(stateCounter);
  subsetToDfaId.set(initialKey, initialDfaId);
  subsetToLabel.set(initialKey, initialLabel);
  subsetToStates.set(initialKey, initialSubset);
  subsetMap[initialDfaId] = initialSubset;
  stateCounter++;

  // Queue of state keys to process
  const queue: string[] = [initialKey];
  const processedKeys = new Set<string>();

  const dfaStates: AutomatonState[] = [];
  const dfaTransitions: AutomatonTransition[] = [];

  // Helper to format state set for display e.g. "{q0, q1}"
  const formatSetDisplay = (stateIds: string[]): string => {
    if (stateIds.length === 0) return '∅';
    const labels = stateIds
      .map((id) => nfa.states.find((s) => s.id === id)?.label || id)
      .sort();
    return `{${labels.join(', ')}}`;
  };

  // Determine if a subset contains any NFA final state
  const isSubsetFinal = (stateIds: string[]): boolean => {
    return stateIds.some((id) => nfa.states.find((s) => s.id === id)?.isFinal);
  };

  let deadStateKey: string | null = null;
  let hasDeadState = false;

  // Alphabet without epsilon
  const cleanAlphabet = nfa.alphabet.filter(
    (sym) => sym !== 'ε' && sym !== 'E' && sym !== 'eps' && sym !== 'e'
  );

  let stepNumber = 1;

  while (queue.length > 0) {
    const currentKey = queue.shift()!;
    processedKeys.add(currentKey);

    const currentSubset = subsetToStates.get(currentKey)!;
    const currentDfaId = subsetToDfaId.get(currentKey)!;
    const currentSubsetName = subsetToLabel.get(currentKey)!;

    // Ensure the source state exists in dfaStates
    if (!dfaStates.some((s) => s.id === currentDfaId)) {
      dfaStates.push({
        id: currentDfaId,
        label: `${currentSubsetName}: ${formatSetDisplay(currentSubset)}`,
        isInitial: currentDfaId === initialDfaId,
        isFinal: isSubsetFinal(currentSubset),
      });
    }

    // Process each alphabet symbol
    for (const symbol of cleanAlphabet) {
      // 1. Direct moves on symbol
      const directMoves = getDirectMoves(currentSubset, symbol, nfa);

      // 2. Epsilon closure of direct moves
      const targetSubset = computeEpsilonClosure(directMoves, nfa);
      const targetKey = getStateSetKey(targetSubset);

      let targetDfaId: string;
      let targetSubsetName: string;
      let isNewSubset = false;

      if (targetSubset.length === 0) {
        // Dead / Trap state handling for complete DFA
        hasDeadState = true;
        if (!deadStateKey) {
          deadStateKey = '__DEAD__';
          targetDfaId = 'DFA_TRAP';
          targetSubsetName = '∅ (Trap)';
          subsetToDfaId.set(deadStateKey, targetDfaId);
          subsetToLabel.set(deadStateKey, targetSubsetName);
          subsetToStates.set(deadStateKey, []);
          subsetMap[targetDfaId] = [];

          // Add dead state to DFA
          dfaStates.push({
            id: targetDfaId,
            label: 'Trap: ∅',
            isInitial: false,
            isFinal: false,
          });

          // Self loop on all symbols for dead state
          for (const sym of cleanAlphabet) {
            dfaTransitions.push({
              id: `trans_trap_${sym}`,
              from: targetDfaId,
              to: targetDfaId,
              symbol: sym,
            });
          }
          isNewSubset = true;
        } else {
          targetDfaId = subsetToDfaId.get(deadStateKey)!;
          targetSubsetName = subsetToLabel.get(deadStateKey)!;
        }
      } else {
        if (!subsetToDfaId.has(targetKey)) {
          isNewSubset = true;
          targetDfaId = `DFA_${stateCounter}`;
          targetSubsetName = stateLetter(stateCounter);
          stateCounter++;

          subsetToDfaId.set(targetKey, targetDfaId);
          subsetToLabel.set(targetKey, targetSubsetName);
          subsetToStates.set(targetKey, targetSubset);
          subsetMap[targetDfaId] = targetSubset;

          dfaStates.push({
            id: targetDfaId,
            label: `${targetSubsetName}: ${formatSetDisplay(targetSubset)}`,
            isInitial: false,
            isFinal: isSubsetFinal(targetSubset),
          });

          queue.push(targetKey);
        } else {
          targetDfaId = subsetToDfaId.get(targetKey)!;
          targetSubsetName = subsetToLabel.get(targetKey)!;
        }
      }

      // Add transition if not already added
      const transitionId = `trans_${currentDfaId}_${symbol}_${targetDfaId}`;
      const existingTrans = dfaTransitions.find(
        (t) => t.from === currentDfaId && t.to === targetDfaId && t.symbol === symbol
      );
      if (!existingTrans) {
        dfaTransitions.push({
          id: transitionId,
          from: currentDfaId,
          to: targetDfaId,
          symbol: symbol,
        });
      }

      // Find active NFA transitions corresponding to this step for diagram highlighting
      const activeNfaTrans = nfa.transitions
        .filter((t) => currentSubset.includes(t.from) && t.symbol === symbol)
        .map((t) => t.id);

      // Formulate detailed educational explanation
      let explanation = `Step ${stepNumber}: Examine state ${currentSubsetName} = ${formatSetDisplay(
        currentSubset
      )} on symbol '${symbol}'.\n`;
      explanation += `• Direct moves δ(${formatSetDisplay(currentSubset)}, '${symbol}') = ${formatSetDisplay(
        directMoves
      )}.\n`;
      if (nfa.transitions.some((t) => t.symbol === 'ε')) {
        explanation += `• Applying ε-closure yields ${formatSetDisplay(targetSubset)}.\n`;
      }
      if (targetSubset.length === 0) {
        explanation += `• Since the target is empty, transition leads to Dead/Trap State (∅).\n`;
      } else if (isNewSubset) {
        explanation += `• Newly discovered subset! Designated as new DFA State ${targetSubsetName} ${
          isSubsetFinal(targetSubset) ? '(Accepting State ★)' : ''
        }.\n`;
      } else {
        explanation += `• Reaches existing DFA State ${targetSubsetName}.\n`;
      }

      steps.push({
        stepNumber: stepNumber++,
        sourceSubsetName: currentSubsetName,
        sourceSubsetStates: currentSubset,
        symbol: symbol,
        moveSet: directMoves,
        targetSubsetStates: targetSubset,
        targetSubsetName: targetSubsetName,
        isNewSubset: isNewSubset,
        explanation: explanation,
        snapshotDfaStates: JSON.parse(JSON.stringify(dfaStates)),
        snapshotDfaTransitions: JSON.parse(JSON.stringify(dfaTransitions)),
        activeNfaStates: [...currentSubset, ...targetSubset],
        activeNfaTransitions: activeNfaTrans,
      });
    }
  }

  // Layout positions for DFA states (circular / radial for clean diagram)
  const totalDfaStates = dfaStates.length;
  const radius = Math.max(160, totalDfaStates * 45);
  const centerX = 300;
  const centerY = 260;

  dfaStates.forEach((state, idx) => {
    const angle = (2 * Math.PI * idx) / totalDfaStates - Math.PI / 2;
    state.x = Math.round(centerX + radius * Math.cos(angle));
    state.y = Math.round(centerY + radius * Math.sin(angle));
  });

  const convertedDfa: Automaton = {
    id: `dfa_converted_${Date.now()}`,
    name: `DFA (Converted from ${nfa.name || 'NFA'})`,
    type: 'DFA',
    alphabet: cleanAlphabet,
    states: dfaStates,
    transitions: dfaTransitions,
    description: `DFA constructed via Subset Construction from "${nfa.name || 'NFA'}" with ${dfaStates.length} states.`,
  };

  return {
    dfa: convertedDfa,
    steps: steps,
    subsetMap: subsetMap,
    hasDeadState: hasDeadState,
    summary: {
      initialSubset: initialSubset,
      totalSubsetsExamined: dfaStates.length,
      finalDfaStateCount: dfaStates.length,
      finalDfaTransitionCount: dfaTransitions.length,
    },
  };
}

