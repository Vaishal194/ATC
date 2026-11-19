import { Automaton } from '../types/automata';

export interface DfaToNfaResult {
  nfa: Automaton;
  explanation: string;
  differences: {
    stateCount: number;
    alphabetCount: number;
    transitionCount: number;
    isIdenticalStructure: boolean;
  };
}

/**
 * Converts a Deterministic Finite Automaton (DFA) into an equivalent Non-Deterministic Finite Automaton (NFA).
 *
 * Automata Theory Principle:
 * By definition, every DFA is already an NFA where:
 * 1. |δ_NFA(q, a)| = 1 for all q ∈ Q and a ∈ Σ.
 * 2. There are zero ε-transitions: δ_NFA(q, ε) = ∅.
 * Thus, the transition function δ_DFA: Q × Σ → Q is formally re-mapped to
 * δ_NFA: Q × (Σ ∪ {ε}) → P(Q) with δ_NFA(q, a) = {δ_DFA(q, a)}.
 */
export function convertDfaToNfa(dfa: Automaton): DfaToNfaResult {
  const nfaStates = dfa.states.map((s) => ({ ...s }));
  const nfaTransitions = dfa.transitions.map((t) => ({ ...t }));

  const nfa: Automaton = {
    id: `nfa_from_dfa_${Date.now()}`,
    name: `NFA (Equivalent to ${dfa.name || 'DFA'})`,
    type: 'NFA',
    alphabet: [...dfa.alphabet],
    states: nfaStates,
    transitions: nfaTransitions,
    description: `Equivalent NFA generated from DFA "${dfa.name || 'DFA'}". Every DFA transition is represented as a singleton target set in the NFA.`,
  };

  const explanation = `
Formal Equivalence:
In Formal Language Theory, a Deterministic Finite Automaton M_DFA = (Q, Σ, δ_DFA, q0, F) is a restricted special case of a Non-Deterministic Finite Automaton M_NFA = (Q, Σ, δ_NFA, q0, F).

Key Transformation Properties:
1. States & Alphabet: The state set Q, alphabet Σ, start state q0, and final states F remain 100% identical.
2. Transition Mapping: In the DFA, δ_DFA: Q × Σ → Q returns a single state. In the NFA, δ_NFA: Q × (Σ ∪ {ε}) → 𝒫(Q) maps to subsets of Q. Each transition δ_DFA(p, a) = q maps directly to the singleton set δ_NFA(p, a) = {q}.
3. Zero Non-determinism: No epsilon-transitions (ε) or branching on identical symbols are introduced.
4. Language Preservation: L(M_NFA) = L(M_DFA). Because every transition path in the DFA is preserved verbatim in the NFA, both automata accept precisely the exact same set of strings.
  `.trim();

  return {
    nfa,
    explanation,
    differences: {
      stateCount: nfaStates.length,
      alphabetCount: nfa.alphabet.length,
      transitionCount: nfaTransitions.length,
      isIdenticalStructure: true,
    },
  };
}

