import { describe, it, expect } from 'vitest';
import { computeEpsilonClosure } from './epsilonClosure';
import { convertNfaToDfa } from './nfaToDfa';
import { convertDfaToNfa } from './dfaToNfa';
import { simulateDFA } from './simulateDFA';
import { simulateNFA } from './simulateNFA';
import { EXAMPLE_AUTOMATA } from '../utils/examples';
import { Automaton } from '../types/automata';

describe('Automata Algorithms & Correctness Suite', () => {
  describe('Epsilon Closure', () => {
    it('should compute epsilon closure with chains and branches', () => {
      const epsAutomaton: Automaton = {
        id: 'test_eps',
        name: 'Eps Test',
        type: 'NFA',
        alphabet: ['a', 'b'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: false },
          { id: 'q1', label: 'q1', isInitial: false, isFinal: false },
          { id: 'q2', label: 'q2', isInitial: false, isFinal: false },
          { id: 'q3', label: 'q3', isInitial: false, isFinal: false },
        ],
        transitions: [
          { id: 't1', from: 'q0', to: 'q1', symbol: 'ε' },
          { id: 't2', from: 'q1', to: 'q2', symbol: 'ε' },
          { id: 't3', from: 'q0', to: 'q3', symbol: 'a' },
        ],
      };

      const closureQ0 = computeEpsilonClosure(['q0'], epsAutomaton);
      expect(closureQ0).toEqual(['q0', 'q1', 'q2'].sort());

      const closureQ1 = computeEpsilonClosure(['q1'], epsAutomaton);
      expect(closureQ1).toEqual(['q1', 'q2'].sort());

      const closureQ3 = computeEpsilonClosure(['q3'], epsAutomaton);
      expect(closureQ3).toEqual(['q3']);
    });

    it('should handle epsilon cycles without infinite loops', () => {
      const cycleAutomaton: Automaton = {
        id: 'cycle_eps',
        name: 'Cycle Eps',
        type: 'NFA',
        alphabet: ['0'],
        states: [
          { id: 'qA', label: 'qA', isInitial: true, isFinal: false },
          { id: 'qB', label: 'qB', isInitial: false, isFinal: false },
        ],
        transitions: [
          { id: 't1', from: 'qA', to: 'qB', symbol: 'ε' },
          { id: 't2', from: 'qB', to: 'qA', symbol: 'ε' },
        ],
      };

      const closure = computeEpsilonClosure(['qA'], cycleAutomaton);
      expect(closure).toEqual(['qA', 'qB'].sort());
    });
  });

  describe('DFA Simulation', () => {
    const dfaEven0 = EXAMPLE_AUTOMATA.find((ex) => ex.id === 'dfa-even-zeros')!.automaton;

    it('should accept strings with even number of 0s', () => {
      expect(simulateDFA(dfaEven0, '').isAccepted).toBe(true);
      expect(simulateDFA(dfaEven0, '1').isAccepted).toBe(true);
      expect(simulateDFA(dfaEven0, '00').isAccepted).toBe(true);
      expect(simulateDFA(dfaEven0, '010').isAccepted).toBe(true);
      expect(simulateDFA(dfaEven0, '1001').isAccepted).toBe(true);
      expect(simulateDFA(dfaEven0, '0000').isAccepted).toBe(true);
    });

    it('should reject strings with odd number of 0s', () => {
      expect(simulateDFA(dfaEven0, '0').isAccepted).toBe(false);
      expect(simulateDFA(dfaEven0, '01').isAccepted).toBe(false);
      expect(simulateDFA(dfaEven0, '10').isAccepted).toBe(false);
      expect(simulateDFA(dfaEven0, '000').isAccepted).toBe(false);
      expect(simulateDFA(dfaEven0, '1011').isAccepted).toBe(false);
    });

    it('should reject invalid symbols not in alphabet', () => {
      const result = simulateDFA(dfaEven0, '00a1');
      expect(result.isAccepted).toBe(false);
      expect(result.reason).toContain("not in the automaton alphabet");
    });
  });

  describe('NFA Simulation', () => {
    const nfaEnds01 = EXAMPLE_AUTOMATA.find((ex) => ex.id === 'nfa-ends-in-01')!.automaton;

    it('should accept strings ending in 01', () => {
      expect(simulateNFA(nfaEnds01, '01').isAccepted).toBe(true);
      expect(simulateNFA(nfaEnds01, '001').isAccepted).toBe(true);
      expect(simulateNFA(nfaEnds01, '101').isAccepted).toBe(true);
      expect(simulateNFA(nfaEnds01, '11001').isAccepted).toBe(true);
      expect(simulateNFA(nfaEnds01, '0101').isAccepted).toBe(true);
    });

    it('should reject strings not ending in 01', () => {
      expect(simulateNFA(nfaEnds01, '0').isAccepted).toBe(false);
      expect(simulateNFA(nfaEnds01, '1').isAccepted).toBe(false);
      expect(simulateNFA(nfaEnds01, '10').isAccepted).toBe(false);
      expect(simulateNFA(nfaEnds01, '00').isAccepted).toBe(false);
      expect(simulateNFA(nfaEnds01, '010').isAccepted).toBe(false);
    });
  });

  describe('NFA to DFA Conversion & Equivalence Verification', () => {
    it('should convert NFA (ends in 01) to a valid DFA and preserve language equivalence', () => {
      const nfa = EXAMPLE_AUTOMATA.find((ex) => ex.id === 'nfa-ends-in-01')!.automaton;
      const result = convertNfaToDfa(nfa);

      expect(result.dfa).toBeDefined();
      expect(result.dfa.type).toBe('DFA');
      expect(result.steps.length).toBeGreaterThan(0);

      // Verify that every DFA state has exactly one outgoing transition per alphabet symbol
      for (const state of result.dfa.states) {
        for (const sym of result.dfa.alphabet) {
          const transitions = result.dfa.transitions.filter(
            (t) => t.from === state.id && t.symbol === sym
          );
          expect(transitions.length).toBe(1);
        }
      }

      // Test suite of test strings on BOTH NFA and converted DFA
      const testStrings = [
        '01', '001', '101', '11001', '0101', '11101',
        '0', '1', '10', '00', '111', '010', '100', '011'
      ];

      for (const str of testStrings) {
        const nfaResult = simulateNFA(nfa, str);
        const dfaResult = simulateDFA(result.dfa, str);
        expect(dfaResult.isAccepted).toBe(nfaResult.isAccepted);
      }
    });

    it('should correctly convert an Epsilon-NFA to DFA and preserve language equivalence', () => {
      const epsNfa = EXAMPLE_AUTOMATA.find((ex) => ex.id === 'nfa-epsilon-transitions')!.automaton;
      const result = convertNfaToDfa(epsNfa);

      expect(result.dfa).toBeDefined();
      expect(result.dfa.states.length).toBeGreaterThan(0);

      // Test strings ending in 01 or 10
      const testCases = [
        { str: '01', expected: true },
        { str: '10', expected: true },
        { str: '001', expected: true },
        { str: '110', expected: true },
        { str: '1010', expected: true },
        { str: '00', expected: false },
        { str: '11', expected: false },
        { str: '0', expected: false },
        { str: '1', expected: false },
      ];

      for (const { str, expected } of testCases) {
        const nfaRes = simulateNFA(epsNfa, str);
        const dfaRes = simulateDFA(result.dfa, str);

        expect(nfaRes.isAccepted).toBe(expected);
        expect(dfaRes.isAccepted).toBe(expected);
      }
    });

    it('should correctly convert NFA containing "101" to DFA', () => {
      const nfa = EXAMPLE_AUTOMATA.find((ex) => ex.id === 'nfa-contains-101')!.automaton;
      const result = convertNfaToDfa(nfa);

      const testStrings = ['101', '0101', '1010', '1110100', '10', '01', '1100', '0000'];

      for (const str of testStrings) {
        const nfaResult = simulateNFA(nfa, str);
        const dfaResult = simulateDFA(result.dfa, str);
        expect(dfaResult.isAccepted).toBe(nfaResult.isAccepted);
      }
    });
  });

  describe('DFA to NFA Conversion', () => {
    it('should preserve states and transitions when converting DFA to NFA', () => {
      const dfa = EXAMPLE_AUTOMATA.find((ex) => ex.id === 'dfa-even-zeros')!.automaton;
      const { nfa, differences } = convertDfaToNfa(dfa);

      expect(nfa.type).toBe('NFA');
      expect(nfa.states.length).toBe(dfa.states.length);
      expect(nfa.transitions.length).toBe(dfa.transitions.length);
      expect(differences.isIdenticalStructure).toBe(true);

      const testStrings = ['', '1', '00', '010', '0', '01', '000'];
      for (const str of testStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(simulateDFA(dfa, str).isAccepted);
      }
    });
  });
});

