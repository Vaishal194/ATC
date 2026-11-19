import { describe, it, expect } from 'vitest';
import { parseRegex } from './regexParser';
import { buildThompsonNfa } from './thompsonConstruction';
import { convertNfaToDfa } from './nfaToDfa';
import { simulateNFA } from './simulateNFA';
import { simulateDFA } from './simulateDFA';

describe("Regex Parser and Thompson's Construction Test Suite", () => {
  describe('Regular Expression Parser & Shunting-Yard Infix to Postfix', () => {
    it('should parse single symbol expression', () => {
      const res = parseRegex('a');
      expect(res.isValid).toBe(true);
      expect(res.postfix).toEqual(['a']);
      expect(res.alphabet).toEqual(['a']);
    });

    it('should parse union with lowest precedence', () => {
      const res = parseRegex('a|b');
      expect(res.isValid).toBe(true);
      expect(res.postfix).toEqual(['a', 'b', '|']);
      expect(res.alphabet).toEqual(['a', 'b']);
    });

    it('should insert implicit concatenation correctly', () => {
      const res = parseRegex('ab');
      expect(res.isValid).toBe(true);
      expect(res.formattedWithConcat).toBe('a.b');
      expect(res.postfix).toEqual(['a', 'b', '.']);
    });

    it('should handle Kleene star with higher precedence than concatenation', () => {
      // ab* should be a.(b*)
      const res = parseRegex('ab*');
      expect(res.isValid).toBe(true);
      expect(res.formattedWithConcat).toBe('a.b*');
      expect(res.postfix).toEqual(['a', 'b', '*', '.']);
    });

    it('should respect parentheses grouping', () => {
      // (a|b)*abb -> (a|b)*.a.b.b
      const res = parseRegex('(a|b)*abb');
      expect(res.isValid).toBe(true);
      expect(res.postfix).toEqual(['a', 'b', '|', '*', 'a', '.', 'b', '.', 'b', '.']);
    });

    it('should handle positive closure (+)', () => {
      const res = parseRegex('a+b');
      expect(res.isValid).toBe(true);
      expect(res.postfix).toEqual(['a', '+', 'b', '.']);
    });

    it('should detect syntax errors in malformed expressions', () => {
      expect(parseRegex('').isValid).toBe(false);
      expect(parseRegex('a||b').isValid).toBe(false);
      expect(parseRegex('|a').isValid).toBe(false);
      expect(parseRegex('a|').isValid).toBe(false);
      expect(parseRegex('*a').isValid).toBe(false);
      expect(parseRegex('(a|b').isValid).toBe(false);
      expect(parseRegex('a|b)').isValid).toBe(false);
      expect(parseRegex('()').isValid).toBe(false);
    });
  });

  describe("Thompson's Construction NFA Generation", () => {
    it('should build valid NFA for base symbol "a"', () => {
      const { nfa, steps } = buildThompsonNfa('a');
      expect(nfa.type).toBe('NFA');
      expect(nfa.states.length).toBe(2);
      expect(nfa.transitions.length).toBe(1);
      expect(nfa.transitions[0].symbol).toBe('a');
      expect(steps.length).toBe(1);
    });

    it('should build valid NFA for Union "a|b"', () => {
      const { nfa, steps } = buildThompsonNfa('a|b');
      // 2 states for 'a', 2 for 'b', 2 new states (start + final) = 6 states
      expect(nfa.states.length).toBe(6);
      expect(steps.length).toBe(3); // 'a', 'b', '|'
      const startState = nfa.states.find((s) => s.isInitial);
      const finalStates = nfa.states.filter((s) => s.isFinal);
      expect(startState).toBeDefined();
      expect(finalStates.length).toBe(1);
    });

    it('should build valid NFA for Concatenation "ab"', () => {
      const { nfa, steps } = buildThompsonNfa('ab');
      // 2 states for 'a', 2 states for 'b', 1 connecting epsilon transition = 4 states, 3 transitions
      expect(nfa.states.length).toBe(4);
      expect(nfa.transitions.length).toBe(3);
      expect(steps.length).toBe(3); // 'a', 'b', '.'
    });

    it('should build valid NFA for Kleene Star "a*"', () => {
      const { nfa, steps } = buildThompsonNfa('a*');
      // 2 states for 'a', 2 new states = 4 states
      // 1 symbol transition + 4 epsilon transitions = 5 transitions
      expect(nfa.states.length).toBe(4);
      expect(nfa.transitions.length).toBe(5);
      expect(steps.length).toBe(2); // 'a', '*'
    });
  });

  describe('String Simulation and NFA-to-DFA Equivalence on Thompson Automata', () => {
    it('Expression: "a|b"', () => {
      const { nfa } = buildThompsonNfa('a|b');
      const dfaRes = convertNfaToDfa(nfa);
      const dfa = dfaRes.dfa;

      const testCases = [
        { str: 'a', expected: true },
        { str: 'b', expected: true },
        { str: '', expected: false },
        { str: 'ab', expected: false },
        { str: 'aa', expected: false },
      ];

      for (const { str, expected } of testCases) {
        const nfaResult = simulateNFA(nfa, str);
        const dfaResult = simulateDFA(dfa, str);
        expect(nfaResult.isAccepted).toBe(expected);
        expect(dfaResult.isAccepted).toBe(expected);
      }
    });

    it('Expression: "a*"', () => {
      const { nfa } = buildThompsonNfa('a*');
      const dfaRes = convertNfaToDfa(nfa);
      const dfa = dfaRes.dfa;

      const testCases = [
        { str: '', expected: true },
        { str: 'a', expected: true },
        { str: 'aa', expected: true },
        { str: 'aaa', expected: true },
        { str: 'b', expected: false },
        { str: 'ab', expected: false },
      ];

      for (const { str, expected } of testCases) {
        const nfaResult = simulateNFA(nfa, str);
        const dfaResult = simulateDFA(dfa, str);
        expect(nfaResult.isAccepted).toBe(expected);
        expect(dfaResult.isAccepted).toBe(expected);
      }
    });

    it('Expression: "ab*"', () => {
      const { nfa } = buildThompsonNfa('ab*');
      const dfaRes = convertNfaToDfa(nfa);
      const dfa = dfaRes.dfa;

      const testCases = [
        { str: 'a', expected: true },
        { str: 'ab', expected: true },
        { str: 'abb', expected: true },
        { str: 'abbb', expected: true },
        { str: '', expected: false },
        { str: 'b', expected: false },
        { str: 'ba', expected: false },
      ];

      for (const { str, expected } of testCases) {
        const nfaResult = simulateNFA(nfa, str);
        const dfaResult = simulateDFA(dfa, str);
        expect(nfaResult.isAccepted).toBe(expected);
        expect(dfaResult.isAccepted).toBe(expected);
      }
    });

    it('Expression: "(a|b)*abb"', () => {
      const { nfa } = buildThompsonNfa('(a|b)*abb');
      const dfaRes = convertNfaToDfa(nfa);
      const dfa = dfaRes.dfa;

      const testCases = [
        { str: 'abb', expected: true },
        { str: 'aabb', expected: true },
        { str: 'babb', expected: true },
        { str: 'abababb', expected: true },
        { str: 'ab', expected: false },
        { str: 'aab', expected: false },
        { str: 'abba', expected: false },
        { str: '', expected: false },
      ];

      for (const { str, expected } of testCases) {
        const nfaResult = simulateNFA(nfa, str);
        const dfaResult = simulateDFA(dfa, str);
        expect(nfaResult.isAccepted).toBe(expected);
        expect(dfaResult.isAccepted).toBe(expected);
      }
    });

    it('Expression: "(0|1)*101"', () => {
      const { nfa } = buildThompsonNfa('(0|1)*101');
      const dfaRes = convertNfaToDfa(nfa);
      const dfa = dfaRes.dfa;

      const testCases = [
        { str: '101', expected: true },
        { str: '0101', expected: true },
        { str: '1101', expected: true },
        { str: '00101', expected: true },
        { str: '100', expected: false },
        { str: '1010', expected: false },
        { str: '1', expected: false },
        { str: '', expected: false },
      ];

      for (const { str, expected } of testCases) {
        const nfaResult = simulateNFA(nfa, str);
        const dfaResult = simulateDFA(dfa, str);
        expect(nfaResult.isAccepted).toBe(expected);
        expect(dfaResult.isAccepted).toBe(expected);
      }
    });

    it('Expression with epsilon: "a|ε"', () => {
      const { nfa } = buildThompsonNfa('a|ε');
      const dfaRes = convertNfaToDfa(nfa);
      const dfa = dfaRes.dfa;

      expect(simulateNFA(nfa, '').isAccepted).toBe(true);
      expect(simulateNFA(nfa, 'a').isAccepted).toBe(true);
      expect(simulateNFA(nfa, 'aa').isAccepted).toBe(false);

      expect(simulateDFA(dfa, '').isAccepted).toBe(true);
      expect(simulateDFA(dfa, 'a').isAccepted).toBe(true);
      expect(simulateDFA(dfa, 'aa').isAccepted).toBe(false);
    });
  });
});
