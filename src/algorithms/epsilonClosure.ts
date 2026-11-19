import { Automaton, EPSILON } from '../types/automata';

/**
 * Computes the Epsilon Closure (ε-closure) for a given set of states in an automaton.
 * The ε-closure of a set of states S is the set of all states reachable from any state in S
 * by following zero or more ε (epsilon) transitions.
 *
 * @param stateIds - Array of initial state IDs
 * @param automaton - The automaton containing transitions
 * @returns Sorted array of unique state IDs reachable via ε-transitions
 */
export function computeEpsilonClosure(stateIds: string[], automaton: Automaton): string[] {
  const closure = new Set<string>(stateIds);
  const queue: string[] = [...stateIds];

  // Map of fromState -> array of toStates for epsilon transitions
  const epsilonAdjacency = new Map<string, string[]>();
  for (const t of automaton.transitions) {
    if (t.symbol === EPSILON || t.symbol === 'E' || t.symbol === 'e' || t.symbol === 'eps' || t.symbol === 'ε') {
      const existing = epsilonAdjacency.get(t.from) || [];
      existing.push(t.to);
      epsilonAdjacency.set(t.from, existing);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = epsilonAdjacency.get(current) || [];

    for (const nextState of neighbors) {
      if (!closure.has(nextState)) {
        closure.add(nextState);
        queue.push(nextState);
      }
    }
  }

  return Array.from(closure).sort();
}

/**
 * Computes direct transitions from a set of states on a given symbol.
 * Does NOT apply epsilon closure (that is done separately in subset construction).
 */
export function getDirectMoves(stateIds: string[], symbol: string, automaton: Automaton): string[] {
  const targetStates = new Set<string>();

  for (const t of automaton.transitions) {
    if (stateIds.includes(t.from) && t.symbol === symbol) {
      targetStates.add(t.to);
    }
  }

  return Array.from(targetStates).sort();
}

/**
 * Checks if two state sets are identical.
 */
export function areStateSetsEqual(setA: string[], setB: string[]): boolean {
  if (setA.length !== setB.length) return false;
  const sortedA = [...setA].sort();
  const sortedB = [...setB].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

/**
 * Converts a set of states into a canonical key string for Map/Set lookups.
 * e.g. ["q1", "q0"] -> "q0,q1"
 */
export function getStateSetKey(stateIds: string[]): string {
  return [...stateIds].sort().join(',');
}

