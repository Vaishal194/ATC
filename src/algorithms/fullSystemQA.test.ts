import { describe, it, expect } from 'vitest';
import { Automaton } from '../types/automata';
import { convertDfaToNfa } from './dfaToNfa';
import { convertNfaToDfa } from './nfaToDfa';
import { parseRegex } from './regexParser';
import { buildThompsonNfa } from './thompsonConstruction';
import { simulateDFA } from './simulateDFA';
import { simulateNFA } from './simulateNFA';

describe('AUTOMATA STUDIO - FULL SYSTEM QA TEST SUITE', () => {
  // ==========================================
  // PHASE 2: DFA TO NFA TESTING
  // ==========================================
  describe('PHASE 2: DFA to NFA Conversion', () => {
    it('QA-D2N-01: Simple DFA with 2 states', () => {
      const dfa: Automaton = {
        id: 'dfa_simple',
        name: 'Simple DFA',
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

      const { nfa, differences } = convertDfaToNfa(dfa);

      expect(nfa.type).toBe('NFA');
      expect(nfa.states.length).toBe(dfa.states.length);
      expect(nfa.transitions.length).toBe(dfa.transitions.length);
      expect(nfa.states.find((s) => s.isInitial)?.id).toBe('q0');
      expect(nfa.states.find((s) => s.isFinal)?.id).toBe('q1');
      expect(differences.isIdenticalStructure).toBe(true);

      // Verify language preservation
      const testCases = ['0', '10', '00', '110', '1', '11', '01'];
      for (const str of testCases) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(simulateDFA(dfa, str).isAccepted);
      }
    });

    it('QA-D2N-02: DFA with multiple final states', () => {
      const dfa: Automaton = {
        id: 'dfa_multi_final',
        name: 'DFA Multiple Finals',
        type: 'DFA',
        alphabet: ['a', 'b'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: false },
          { id: 'q1', label: 'q1', isInitial: false, isFinal: true },
          { id: 'q2', label: 'q2', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
          { id: 't2', from: 'q0', to: 'q2', symbol: 'b' },
          { id: 't3', from: 'q1', to: 'q1', symbol: 'a' },
          { id: 't4', from: 'q1', to: 'q2', symbol: 'b' },
          { id: 't5', from: 'q2', to: 'q1', symbol: 'a' },
          { id: 't6', from: 'q2', to: 'q2', symbol: 'b' },
        ],
      };

      const { nfa } = convertDfaToNfa(dfa);
      const nfaFinals = nfa.states.filter((s) => s.isFinal).map((s) => s.id);
      expect(nfaFinals.sort()).toEqual(['q1', 'q2'].sort());

      // Accepts any non-empty string of a and b
      expect(simulateNFA(nfa, 'a').isAccepted).toBe(true);
      expect(simulateNFA(nfa, 'b').isAccepted).toBe(true);
      expect(simulateNFA(nfa, 'ab').isAccepted).toBe(true);
      expect(simulateNFA(nfa, '').isAccepted).toBe(false);
    });

    it('QA-D2N-03: DFA with self-loops and 3 alphabet symbols', () => {
      const dfa: Automaton = {
        id: 'dfa_3_sym',
        name: 'DFA 3 Symbols',
        type: 'DFA',
        alphabet: ['0', '1', '2'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'q0', to: 'q0', symbol: '0' },
          { id: 't2', from: 'q0', to: 'q0', symbol: '1' },
          { id: 't3', from: 'q0', to: 'q0', symbol: '2' },
        ],
      };

      const { nfa } = convertDfaToNfa(dfa);
      expect(nfa.transitions.length).toBe(3);
      expect(simulateNFA(nfa, '012021').isAccepted).toBe(true);
    });

    it('QA-D2N-04: DFA with dead state and unreachable states', () => {
      const dfa: Automaton = {
        id: 'dfa_dead_unreachable',
        name: 'DFA Dead and Unreachable',
        type: 'DFA',
        alphabet: ['a', 'b'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: false },
          { id: 'q1', label: 'q1', isInitial: false, isFinal: true },
          { id: 'q_dead', label: 'q_dead', isInitial: false, isFinal: false },
          { id: 'q_unreachable', label: 'q_unreachable', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
          { id: 't2', from: 'q0', to: 'q_dead', symbol: 'b' },
          { id: 't3', from: 'q1', to: 'q1', symbol: 'a' },
          { id: 't4', from: 'q1', to: 'q_dead', symbol: 'b' },
          { id: 't5', from: 'q_dead', to: 'q_dead', symbol: 'a' },
          { id: 't6', from: 'q_dead', to: 'q_dead', symbol: 'b' },
          { id: 't7', from: 'q_unreachable', to: 'q1', symbol: 'a' },
        ],
      };

      const { nfa } = convertDfaToNfa(dfa);
      expect(nfa.states.length).toBe(4);
      expect(simulateNFA(nfa, 'a').isAccepted).toBe(true);
      expect(simulateNFA(nfa, 'aa').isAccepted).toBe(true);
      expect(simulateNFA(nfa, 'ab').isAccepted).toBe(false);
      expect(simulateNFA(nfa, 'b').isAccepted).toBe(false);
    });
  });

  // ==========================================
  // PHASE 3: NFA TO DFA TESTING
  // ==========================================
  describe('PHASE 3: NFA to DFA Subset Construction', () => {
    it('QA-N2D-01: NFA with multiple destinations on the same symbol', () => {
      const nfa: Automaton = {
        id: 'nfa_branch',
        name: 'NFA Branching',
        type: 'NFA',
        alphabet: ['0', '1'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: false },
          { id: 'q1', label: 'q1', isInitial: false, isFinal: false },
          { id: 'q2', label: 'q2', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'q0', to: 'q0', symbol: '0' },
          { id: 't2', from: 'q0', to: 'q1', symbol: '0' },
          { id: 't3', from: 'q1', to: 'q2', symbol: '1' },
        ],
      };

      const result = convertNfaToDfa(nfa);
      const dfa = result.dfa;

      expect(dfa.type).toBe('DFA');
      expect(result.steps.length).toBeGreaterThan(0);

      // Verify completeness: every state has exactly 1 transition per alphabet symbol
      for (const s of dfa.states) {
        for (const sym of dfa.alphabet) {
          const trans = dfa.transitions.filter((t) => t.from === s.id && t.symbol === sym);
          expect(trans.length).toBe(1);
        }
      }

      // Test strings
      const tests = ['01', '001', '0001', '0', '1', '10', '00'];
      for (const str of tests) {
        expect(simulateDFA(dfa, str).isAccepted).toBe(simulateNFA(nfa, str).isAccepted);
      }
    });

    it('QA-N2D-02: NFA with multiple final states and epsilon transitions', () => {
      const nfa: Automaton = {
        id: 'nfa_multi_final_eps',
        name: 'NFA Epsilon Multi Final',
        type: 'NFA',
        alphabet: ['a', 'b'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: false },
          { id: 'q1', label: 'q1', isInitial: false, isFinal: true },
          { id: 'q2', label: 'q2', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'q0', to: 'q1', symbol: 'ε' },
          { id: 't2', from: 'q1', to: 'q2', symbol: 'a' },
          { id: 't3', from: 'q2', to: 'q2', symbol: 'b' },
        ],
      };

      const result = convertNfaToDfa(nfa);
      const dfa = result.dfa;

      // Because q0 -> ε -> q1 (final), the empty string should be accepted by both!
      expect(simulateNFA(nfa, '').isAccepted).toBe(true);
      expect(simulateDFA(dfa, '').isAccepted).toBe(true);

      expect(simulateNFA(nfa, 'a').isAccepted).toBe(true);
      expect(simulateDFA(dfa, 'a').isAccepted).toBe(true);

      expect(simulateNFA(nfa, 'ab').isAccepted).toBe(true);
      expect(simulateDFA(dfa, 'ab').isAccepted).toBe(true);

      expect(simulateNFA(nfa, 'b').isAccepted).toBe(false);
      expect(simulateDFA(dfa, 'b').isAccepted).toBe(false);
    });

    it('QA-N2D-03: NFA with unreachable states is correctly filtered in DFA', () => {
      const nfa: Automaton = {
        id: 'nfa_unreachable',
        name: 'NFA Unreachable State',
        type: 'NFA',
        alphabet: ['0', '1'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: true },
          { id: 'q_ghost', label: 'q_ghost', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'q0', to: 'q0', symbol: '0' },
          { id: 't2', from: 'q_ghost', to: 'q_ghost', symbol: '1' },
        ],
      };

      const result = convertNfaToDfa(nfa);
      // q_ghost should not appear in any DFA state subset
      for (const [, nfaSet] of Object.entries(result.subsetMap)) {
        expect(nfaSet).not.toContain('q_ghost');
      }
    });

    it('QA-N2D-04: NFA with empty transition sets generates Dead/Trap state', () => {
      const nfa: Automaton = {
        id: 'nfa_empty_trans',
        name: 'NFA Empty Transitions',
        type: 'NFA',
        alphabet: ['a', 'b'],
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isFinal: true },
        ],
        transitions: [], // No transitions at all
      };

      const result = convertNfaToDfa(nfa);
      expect(result.hasDeadState).toBe(true);
      // DFA accepts only empty string
      expect(simulateDFA(result.dfa, '').isAccepted).toBe(true);
      expect(simulateDFA(result.dfa, 'a').isAccepted).toBe(false);
      expect(simulateDFA(result.dfa, 'b').isAccepted).toBe(false);
    });
  });

  // ==========================================
  // PHASE 4: REGEX PARSER TESTING
  // ==========================================
  describe('PHASE 4: Regex Parser & Operator Precedence', () => {
    const testExpressions = [
      { regex: 'a', expectedPostfix: ['a'], expectedConcat: 'a' },
      { regex: 'a|b', expectedPostfix: ['a', 'b', '|'], expectedConcat: 'a|b' },
      { regex: 'ab', expectedPostfix: ['a', 'b', '.'], expectedConcat: 'a.b' },
      { regex: 'a*', expectedPostfix: ['a', '*'], expectedConcat: 'a*' },
      { regex: '(a|b)*', expectedPostfix: ['a', 'b', '|', '*'], expectedConcat: '(a|b)*' },
      { regex: 'ab*', expectedPostfix: ['a', 'b', '*', '.'], expectedConcat: 'a.b*' },
      { regex: '(a|b)*abb', expectedPostfix: ['a', 'b', '|', '*', 'a', '.', 'b', '.', 'b', '.'], expectedConcat: '(a|b)*.a.b.b' },
      { regex: 'a(b|c)*', expectedPostfix: ['a', 'b', 'c', '|', '*', '.'], expectedConcat: 'a.(b|c)*' },
      { regex: '(0|1)*101', expectedPostfix: ['0', '1', '|', '*', '1', '.', '0', '.', '1', '.'], expectedConcat: '(0|1)*.1.0.1' },
      { regex: '((a|b)c)*', expectedPostfix: ['a', 'b', '|', 'c', '.', '*'], expectedConcat: '((a|b).c)*' },
    ];

    testExpressions.forEach(({ regex, expectedPostfix, expectedConcat }, idx) => {
      it(`QA-REG-${String(idx + 1).padStart(2, '0')}: Expression "${regex}"`, () => {
        const res = parseRegex(regex);
        expect(res.isValid).toBe(true);
        expect(res.postfix).toEqual(expectedPostfix);
        expect(res.formattedWithConcat).toBe(expectedConcat);
      });
    });

    it('QA-REG-INV: Detection of invalid regular expressions with meaningful error messages', () => {
      const invalidCases = [
        { expr: 'a|', reason: 'dangling union' },
        { expr: '|a', reason: 'leading union' },
        { expr: '(ab', reason: 'unclosed parenthesis' },
        { expr: 'ab)', reason: 'unmatched close parenthesis' },
        { expr: '**', reason: 'leading unary star' },
        { expr: 'a||', reason: 'consecutive union operators' },
        { expr: '()', reason: 'empty group' },
        { expr: '*a', reason: 'star at start' },
        { expr: '+a', reason: 'plus at start' },
        { expr: 'a**', reason: 'consecutive stars' },
      ];

      for (const { expr, reason } of invalidCases) {
        const res = parseRegex(expr);
        expect(res.isValid, `Expression "${expr}" (${reason}) should be invalid`).toBe(false);
        expect(res.error).toBeDefined();
        expect(typeof res.error).toBe('string');
        expect(res.error!.length).toBeGreaterThan(0);
      }
    });

    it('QA-REG-EPS: Handling of explicit epsilon expressions', () => {
      const res = parseRegex('a|ε');
      expect(res.isValid).toBe(true);
      expect(res.postfix).toEqual(['a', 'ε', '|']);
    });
  });

  // ==========================================
  // PHASE 5: THOMPSON'S CONSTRUCTION TESTING
  // ==========================================
  describe("PHASE 5: Thompson's Construction Algorithm Rules", () => {
    it('QA-THOM-01: Rule 1: Basic symbol NFA', () => {
      const { nfa, steps } = buildThompsonNfa('a');
      expect(nfa.states.length).toBe(2);
      expect(nfa.transitions.length).toBe(1);
      expect(nfa.states.filter((s) => s.isInitial).length).toBe(1);
      expect(nfa.states.filter((s) => s.isFinal).length).toBe(1);
      expect(steps[0].operationType).toBe('SYMBOL');
    });

    it('QA-THOM-02: Rule 2: Union NFA', () => {
      const { nfa, steps } = buildThompsonNfa('a|b');
      expect(nfa.states.length).toBe(6);
      expect(nfa.transitions.length).toBe(6); // 2 symbol transitions + 4 epsilon transitions
      expect(nfa.states.filter((s) => s.isInitial).length).toBe(1);
      expect(nfa.states.filter((s) => s.isFinal).length).toBe(1);
      const unionStep = steps.find((s) => s.operationType === 'UNION');
      expect(unionStep).toBeDefined();
    });

    it('QA-THOM-03: Rule 3: Concatenation NFA', () => {
      const { nfa, steps } = buildThompsonNfa('ab');
      expect(nfa.states.length).toBe(4);
      expect(nfa.transitions.length).toBe(3); // 2 symbol + 1 epsilon connection
      expect(nfa.states.filter((s) => s.isInitial).length).toBe(1);
      expect(nfa.states.filter((s) => s.isFinal).length).toBe(1);
      const concatStep = steps.find((s) => s.operationType === 'CONCAT');
      expect(concatStep).toBeDefined();
    });

    it('QA-THOM-04: Rule 4: Kleene Star NFA', () => {
      const { nfa, steps } = buildThompsonNfa('a*');
      expect(nfa.states.length).toBe(4);
      expect(nfa.transitions.length).toBe(5); // 1 symbol + 4 epsilon
      expect(nfa.states.filter((s) => s.isInitial).length).toBe(1);
      expect(nfa.states.filter((s) => s.isFinal).length).toBe(1);
      const starStep = steps.find((s) => s.operationType === 'STAR');
      expect(starStep).toBeDefined();
    });

    it('QA-THOM-05: Plus Operator (Positive Closure) NFA', () => {
      const { nfa } = buildThompsonNfa('a+');
      expect(nfa.states.length).toBe(4);
      expect(nfa.transitions.length).toBe(4); // 1 symbol + 3 epsilon (no bypass)
      expect(simulateNFA(nfa, '').isAccepted).toBe(false);
      expect(simulateNFA(nfa, 'a').isAccepted).toBe(true);
      expect(simulateNFA(nfa, 'aa').isAccepted).toBe(true);
    });

    it('QA-THOM-06: Every generated state has a unique identifier and no collisions', () => {
      const { nfa } = buildThompsonNfa('((a|b)*abb)+');
      const stateIds = nfa.states.map((s) => s.id);
      const uniqueStateIds = new Set(stateIds);
      expect(uniqueStateIds.size).toBe(stateIds.length);
    });

    it('QA-THOM-07: Intermediate steps match and build up to final NFA', () => {
      const { nfa, steps } = buildThompsonNfa('(a|b)*abb');
      expect(steps.length).toBe(10);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.snapshotAutomaton.states.length).toBe(nfa.states.length);
      expect(lastStep.snapshotAutomaton.transitions.length).toBe(nfa.transitions.length);
    });
  });

  // ==========================================
  // PHASE 6: STRING ACCEPTANCE TESTING
  // ==========================================
  describe('PHASE 6: String Acceptance & Dual NFA/DFA Simulation', () => {
    // Spec 1: a*
    it('QA-SIM-01: Expression "a*" acceptance and rejection', () => {
      const { nfa } = buildThompsonNfa('a*');
      const dfa = convertNfaToDfa(nfa).dfa;

      const acceptStrings = ['', 'a', 'aa', 'aaa'];
      const rejectStrings = ['b', 'ab', 'ba', 'aab'];

      for (const str of acceptStrings) {
        const nRes = simulateNFA(nfa, str);
        const dRes = simulateDFA(dfa, str);
        expect(nRes.isAccepted).toBe(true);
        expect(dRes.isAccepted).toBe(true);
      }

      for (const str of rejectStrings) {
        const nRes = simulateNFA(nfa, str);
        const dRes = simulateDFA(dfa, str);
        expect(nRes.isAccepted).toBe(false);
        expect(dRes.isAccepted).toBe(false);
      }
    });

    // Spec 2: a|b
    it('QA-SIM-02: Expression "a|b" acceptance and rejection', () => {
      const { nfa } = buildThompsonNfa('a|b');
      const dfa = convertNfaToDfa(nfa).dfa;

      const acceptStrings = ['a', 'b'];
      const rejectStrings = ['ab', 'aa', 'ba', 'bb', '', 'c'];

      for (const str of acceptStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(true);
        expect(simulateDFA(dfa, str).isAccepted).toBe(true);
      }

      for (const str of rejectStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(false);
        expect(simulateDFA(dfa, str).isAccepted).toBe(false);
      }
    });

    // Spec 3: (a|b)*abb
    it('QA-SIM-03: Expression "(a|b)*abb" acceptance and rejection', () => {
      const { nfa } = buildThompsonNfa('(a|b)*abb');
      const dfa = convertNfaToDfa(nfa).dfa;

      const acceptStrings = ['abb', 'aabb', 'babb', 'abababb'];
      const rejectStrings = ['ab', 'aab', 'abba', '', 'b', 'a'];

      for (const str of acceptStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(true);
        expect(simulateDFA(dfa, str).isAccepted).toBe(true);
      }

      for (const str of rejectStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(false);
        expect(simulateDFA(dfa, str).isAccepted).toBe(false);
      }
    });

    // Spec 4: (0|1)*101
    it('QA-SIM-04: Expression "(0|1)*101" acceptance and rejection', () => {
      const { nfa } = buildThompsonNfa('(0|1)*101');
      const dfa = convertNfaToDfa(nfa).dfa;

      const acceptStrings = ['101', '0101', '1101'];
      const rejectStrings = ['100', '1010', '0', '1', ''];

      for (const str of acceptStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(true);
        expect(simulateDFA(dfa, str).isAccepted).toBe(true);
      }

      for (const str of rejectStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(false);
        expect(simulateDFA(dfa, str).isAccepted).toBe(false);
      }
    });

    // Spec 5: ((a|b)c)*
    it('QA-SIM-05: Expression "((a|b)c)*" acceptance and rejection', () => {
      const { nfa } = buildThompsonNfa('((a|b)c)*');
      const dfa = convertNfaToDfa(nfa).dfa;

      const acceptStrings = ['', 'ac', 'bc', 'acbc', 'bcac', 'acac', 'bcbc'];
      const rejectStrings = ['a', 'b', 'c', 'ab', 'acc', 'aca'];

      for (const str of acceptStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(true);
        expect(simulateDFA(dfa, str).isAccepted).toBe(true);
      }

      for (const str of rejectStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(false);
        expect(simulateDFA(dfa, str).isAccepted).toBe(false);
      }
    });
  });

  // ==========================================
  // PHASE 8: INTEGRATION TESTING (WORKFLOWS A-D)
  // ==========================================
  describe('PHASE 8: Full Workflows Integration Testing', () => {
    it('QA-INT-01: Workflow A: Create DFA -> Convert to NFA -> Simulate Strings', () => {
      const dfa: Automaton = {
        id: 'dfa_test_flow',
        name: 'DFA Parity Test',
        type: 'DFA',
        alphabet: ['0', '1'],
        states: [
          { id: 's0', label: 's0', isInitial: true, isFinal: true },
          { id: 's1', label: 's1', isInitial: false, isFinal: false },
        ],
        transitions: [
          { id: 't1', from: 's0', to: 's1', symbol: '0' },
          { id: 't2', from: 's0', to: 's0', symbol: '1' },
          { id: 't3', from: 's1', to: 's0', symbol: '0' },
          { id: 't4', from: 's1', to: 's1', symbol: '1' },
        ],
      };

      const { nfa } = convertDfaToNfa(dfa);
      expect(nfa.type).toBe('NFA');

      const simAccept = simulateNFA(nfa, '00');
      expect(simAccept.isAccepted).toBe(true);
      expect(simAccept.finalActiveStateIds).toContain('s0');

      const simReject = simulateNFA(nfa, '0');
      expect(simReject.isAccepted).toBe(false);
      expect(simReject.finalActiveStateIds).toContain('s1');
    });

    it('QA-INT-02: Workflow B: Create NFA -> Convert to DFA -> Simulate Strings', () => {
      const nfa: Automaton = {
        id: 'nfa_test_flow',
        name: 'NFA Suffix 1',
        type: 'NFA',
        alphabet: ['0', '1'],
        states: [
          { id: 'p0', label: 'p0', isInitial: true, isFinal: false },
          { id: 'p1', label: 'p1', isInitial: false, isFinal: true },
        ],
        transitions: [
          { id: 't1', from: 'p0', to: 'p0', symbol: '0' },
          { id: 't2', from: 'p0', to: 'p0', symbol: '1' },
          { id: 't3', from: 'p0', to: 'p1', symbol: '1' },
        ],
      };

      const { dfa } = convertNfaToDfa(nfa);
      expect(dfa.type).toBe('DFA');

      expect(simulateDFA(dfa, '01').isAccepted).toBe(true);
      expect(simulateDFA(dfa, '111').isAccepted).toBe(true);
      expect(simulateDFA(dfa, '0').isAccepted).toBe(false);
      expect(simulateDFA(dfa, '10').isAccepted).toBe(false);
    });

    it('QA-INT-03: Workflow C: Enter Regex -> Generate NFA -> Convert to DFA -> Test Strings', () => {
      const regex = 'a(b|c)*';
      const { nfa } = buildThompsonNfa(regex);
      const { dfa } = convertNfaToDfa(nfa);

      expect(nfa).toBeDefined();
      expect(dfa).toBeDefined();

      const testStrings = ['a', 'ab', 'ac', 'abbc', 'acbc', 'b', 'c', '', 'ba'];
      for (const str of testStrings) {
        expect(simulateNFA(nfa, str).isAccepted).toBe(simulateDFA(dfa, str).isAccepted);
      }
    });

    it('QA-INT-04: Workflow D: Load Regex Sample -> View Steps -> View NFA -> Convert to DFA -> Compare', () => {
      const regex = '(0|1)*101';
      const result = buildThompsonNfa(regex);
      expect(result.steps.length).toBeGreaterThan(0);

      // Verify step progression
      result.steps.forEach((step, idx) => {
        expect(step.stepNumber).toBe(idx + 1);
        expect(step.snapshotAutomaton.states.length).toBeGreaterThan(0);
      });

      const dfaResult = convertNfaToDfa(result.nfa);
      expect(dfaResult.dfa.states.length).toBeGreaterThan(0);
      expect(dfaResult.steps.length).toBeGreaterThan(0);

      // Language equivalence on critical binary strings
      expect(simulateNFA(result.nfa, '101').isAccepted).toBe(true);
      expect(simulateDFA(dfaResult.dfa, '101').isAccepted).toBe(true);
      expect(simulateNFA(result.nfa, '00101').isAccepted).toBe(true);
      expect(simulateDFA(dfaResult.dfa, '00101').isAccepted).toBe(true);
      expect(simulateNFA(result.nfa, '1010').isAccepted).toBe(false);
      expect(simulateDFA(dfaResult.dfa, '1010').isAccepted).toBe(false);
    });
  });
});
