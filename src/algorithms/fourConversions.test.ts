import { describe, it, expect } from 'vitest';
import { Automaton } from '../types/automata';
import { convertDfaToNfa } from './dfaToNfa';
import { convertNfaToDfa } from './nfaToDfa';
import { parseRegex } from './regexParser';
import { buildThompsonNfa } from './thompsonConstruction';
import { simulateDFA } from './simulateDFA';
import { simulateNFA } from './simulateNFA';

describe('FOUR CORE AUTOMATA CONVERSION MODULES - VERIFICATION SUITE', () => {
  // ==========================================
  // MODULE 1: DFA TO NFA
  // ==========================================
  describe('Module 1: DFA to NFA Conversion', () => {
    it('M1-01: Correctly converts DFA to equivalent NFA with singleton sets', () => {
      const dfa: Automaton = {
        id: 'dfa_test',
        name: 'DFA Test',
        type: 'DFA',
        alphabet: ['0', '1'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: false },
          { id: 'q1', label: 'q1', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'q0', to: 'q1', symbol: '0' },
          { id: 't2', from: 'q0', to: 'q0', symbol: '1' },
          { id: 't3', from: 'q1', to: 'q1', symbol: '0' },
          { id: 't4', from: 'q1', to: 'q0', symbol: '1' },
        ],
      };

      const result = convertDfaToNfa(dfa);
      expect(result.nfa.type).toBe('NFA');
      expect(result.nfa.states.length).toBe(dfa.states.length);
      expect(result.nfa.alphabet).toEqual(dfa.alphabet);
      expect(result.nfa.transitions.length).toBe(dfa.transitions.length);

      // Verify language equivalence on strings
      const testStrings = ['0', '10', '110', '1', '01'];
      for (const str of testStrings) {
        const dfaAcc = simulateDFA(dfa, str).isAccepted;
        const nfaAcc = simulateNFA(result.nfa, str).isAccepted;
        expect(nfaAcc).toBe(dfaAcc);
      }
    });
  });

  // ==========================================
  // MODULE 2: NFA TO DFA
  // ==========================================
  describe('Module 2: NFA to DFA Conversion (Subset Construction)', () => {
    it('M2-01: Correctly converts NFA with multiple branchings to DFA', () => {
      const nfa: Automaton = {
        id: 'nfa_ends_01',
        name: 'Ends with 01',
        type: 'NFA',
        alphabet: ['0', '1'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: false },
          { id: 'q1', label: 'q1', isInitial: false, isFinal: false },
          { id: 'q2', label: 'q2', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'q0', to: 'q0', symbol: '0' },
          { id: 't2', from: 'q0', to: 'q0', symbol: '1' },
          { id: 't3', from: 'q0', to: 'q1', symbol: '0' },
          { id: 't4', from: 'q1', to: 'q2', symbol: '1' },
        ],
      };

      const result = convertNfaToDfa(nfa);
      expect(result.dfa.type).toBe('DFA');
      expect(result.dfa.states.length).toBeGreaterThan(0);

      // Verify language equivalence on strings
      const testStrings = ['01', '001', '101', '1101', '0', '1', '10', '00'];
      for (const str of testStrings) {
        const nfaAcc = simulateNFA(nfa, str).isAccepted;
        const dfaAcc = simulateDFA(result.dfa, str).isAccepted;
        expect(dfaAcc).toBe(nfaAcc);
      }
    });

    it('M2-02: Correctly computes epsilon-closures in NFA to DFA', () => {
      const epsNfa: Automaton = {
        id: 'eps_nfa',
        name: 'Eps NFA',
        type: 'NFA',
        alphabet: ['0', '1'],
        states: [
          { id: 's0', label: 's0', isInitial: true, isFinal: false },
          { id: 's1', label: 's1', isInitial: false, isFinal: false },
          { id: 's2', label: 's2', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 's0', to: 's1', symbol: 'ε' },
          { id: 't2', from: 's1', to: 's2', symbol: '0' },
        ],
      };

      const result = convertNfaToDfa(epsNfa);
      // Initial DFA state must contain both s0 and s1
      const initialDfa = result.dfa.states.find((s) => s.isInitial);
      expect(initialDfa).toBeDefined();
      const initialSubset = result.subsetMap[initialDfa!.id];
      expect(initialSubset).toContain('s0');
      expect(initialSubset).toContain('s1');

      // '0' must be accepted
      expect(simulateDFA(result.dfa, '0').isAccepted).toBe(true);
      expect(simulateDFA(result.dfa, '1').isAccepted).toBe(false);
    });

    it('M2-03: Synthesizes Dead State (∅) when transitions are missing for complete DFA', () => {
      const nfa: Automaton = {
        id: 'nfa_partial',
        name: 'NFA Partial',
        type: 'NFA',
        alphabet: ['a', 'b'],
        states: [
          { id: 'p0', label: 'p0', isInitial: true, isFinal: false },
          { id: 'p1', label: 'p1', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'p0', to: 'p1', symbol: 'a' },
          // No transition on 'b', and no transitions from p1
        ],
      };

      const result = convertNfaToDfa(nfa);
      expect(result.hasDeadState).toBe(true);
      // Dead state must exist in DFA
      const deadState = result.dfa.states.find((s) => s.label.includes('∅'));
      expect(deadState).toBeDefined();
      expect(deadState!.isFinal).toBe(false);
    });
  });

  // ==========================================
  // MODULE 3: REGEX TO DFA
  // ==========================================
  describe('Module 3: Regular Expression to DFA', () => {
    it('M3-01: End-to-end Regex -> Thompson NFA -> Subset DFA', () => {
      const regex = '(a|b)*abb';
      const parsed = parseRegex(regex);
      expect(parsed.isValid).toBe(true);

      const thompson = buildThompsonNfa(regex);
      expect(thompson.nfa).toBeDefined();

      const dfaRes = convertNfaToDfa(thompson.nfa);
      expect(dfaRes.dfa.type).toBe('DFA');

      // Test acceptance
      expect(simulateDFA(dfaRes.dfa, 'abb').isAccepted).toBe(true);
      expect(simulateDFA(dfaRes.dfa, 'aabb').isAccepted).toBe(true);
      expect(simulateDFA(dfaRes.dfa, 'babb').isAccepted).toBe(true);
      expect(simulateDFA(dfaRes.dfa, 'ab').isAccepted).toBe(false);
      expect(simulateDFA(dfaRes.dfa, 'ba').isAccepted).toBe(false);
      expect(simulateDFA(dfaRes.dfa, '').isAccepted).toBe(false);
    });

    it('M3-02: Handles binary regex (0|1)*101 to DFA', () => {
      const regex = '(0|1)*101';
      const thompson = buildThompsonNfa(regex);
      const dfaRes = convertNfaToDfa(thompson.nfa);

      expect(simulateDFA(dfaRes.dfa, '101').isAccepted).toBe(true);
      expect(simulateDFA(dfaRes.dfa, '0101').isAccepted).toBe(true);
      expect(simulateDFA(dfaRes.dfa, '11101').isAccepted).toBe(true);
      expect(simulateDFA(dfaRes.dfa, '100').isAccepted).toBe(false);
      expect(simulateDFA(dfaRes.dfa, '010').isAccepted).toBe(false);
    });
  });

  // ==========================================
  // MODULE 4: REGEX TO EPSILON-NFA
  // ==========================================
  describe('Module 4: Regular Expression to Epsilon-NFA (Thompson)', () => {
    it('M4-01: Generates valid Epsilon-NFA with single start and final state', () => {
      const expressions = ['a|b', 'a*', 'ab', '(a|b)*', 'a(b|c)*'];

      for (const expr of expressions) {
        const thompson = buildThompsonNfa(expr);
        const nfa = thompson.nfa;

        // Invariant: strictly 1 start state
        const startStates = nfa.states.filter((s) => s.isInitial);
        expect(startStates.length).toBe(1);

        // Invariant: strictly 1 final state
        const finalStates = nfa.states.filter((s) => s.isFinal);
        expect(finalStates.length).toBe(1);

        // Invariant: Unique state IDs
        const ids = nfa.states.map((s) => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);

        // Invariant: Epsilon transitions are present
        const hasEps = nfa.transitions.some((t) => t.symbol === 'ε');
        expect(hasEps).toBe(true);
      }
    });

    it('M4-02: Rejects invalid regular expressions gracefully', () => {
      const invalidExpressions = ['a|', '|a', '(ab', 'ab)', '**', 'a||', '()'];
      for (const inv of invalidExpressions) {
        const res = parseRegex(inv);
        expect(res.isValid).toBe(false);
        expect(res.error).toBeDefined();
        expect(typeof res.error).toBe('string');
      }
    });
  });
});
