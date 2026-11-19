import { Automaton } from '../types/automata';

export interface ExampleAutomaton {
  id: string;
  title: string;
  category: 'NFA' | 'DFA' | 'Epsilon-NFA';
  description: string;
  sampleAcceptedStrings: string[];
  sampleRejectedStrings: string[];
  automaton: Automaton;
}

export const EXAMPLE_AUTOMATA: ExampleAutomaton[] = [
  {
    id: 'nfa-ends-in-01',
    title: 'NFA: Strings Ending in "01"',
    category: 'NFA',
    description: 'Accepts all binary strings that end with the suffix "01". Non-determinism occurs at q0 on symbol "0" (looping or branching toward acceptance).',
    sampleAcceptedStrings: ['01', '001', '101', '11001', '0101'],
    sampleRejectedStrings: ['0', '1', '10', '00', '111', '010'],
    automaton: {
      id: 'ex_nfa_ends_01',
      name: 'NFA (Ends in 01)',
      type: 'NFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 100, y: 180 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 280, y: 180 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: true, x: 460, y: 180 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: '0' },
        { id: 't2', from: 'q0', to: 'q0', symbol: '1' },
        { id: 't3', from: 'q0', to: 'q1', symbol: '0' },
        { id: 't4', from: 'q1', to: 'q2', symbol: '1' },
      ],
      description: 'L = { w ∈ {0, 1}* | w ends in "01" }',
    },
  },
  {
    id: 'nfa-contains-101',
    title: 'NFA: Contains Substring "101"',
    category: 'NFA',
    description: 'Accepts any binary string containing "101" anywhere as a contiguous substring. Demonstrates non-deterministic lookahead.',
    sampleAcceptedStrings: ['101', '0101', '1010', '1110100', '0001011'],
    sampleRejectedStrings: ['10', '01', '1100', '0000', '1111', '0110'],
    automaton: {
      id: 'ex_nfa_contains_101',
      name: 'NFA (Contains 101)',
      type: 'NFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 180 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 230, y: 180 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: false, x: 380, y: 180 },
        { id: 'q3', label: 'q3', isInitial: false, isFinal: true, x: 530, y: 180 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: '0' },
        { id: 't2', from: 'q0', to: 'q0', symbol: '1' },
        { id: 't3', from: 'q0', to: 'q1', symbol: '1' },
        { id: 't4', from: 'q1', to: 'q2', symbol: '0' },
        { id: 't5', from: 'q2', to: 'q3', symbol: '1' },
        { id: 't6', from: 'q3', to: 'q3', symbol: '0' },
        { id: 't7', from: 'q3', to: 'q3', symbol: '1' },
      ],
      description: 'L = { w ∈ {0, 1}* | w contains "101" }',
    },
  },
  {
    id: 'nfa-epsilon-transitions',
    title: 'ε-NFA: Ends in "01" or "10"',
    category: 'Epsilon-NFA',
    description: 'Uses epsilon (ε) transitions to branch into two parallel verification paths: one detecting suffix "01" and another detecting suffix "10".',
    sampleAcceptedStrings: ['01', '10', '001', '110', '1010', '0101'],
    sampleRejectedStrings: ['00', '11', '0', '1', '011', '100'],
    automaton: {
      id: 'ex_eps_nfa',
      name: 'ε-NFA (Ends in 01 or 10)',
      type: 'NFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 60, y: 200 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 220, y: 120 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: false, x: 380, y: 120 },
        { id: 'q3', label: 'q3', isInitial: false, isFinal: false, x: 220, y: 280 },
        { id: 'q4', label: 'q4', isInitial: false, isFinal: false, x: 380, y: 280 },
        { id: 'q5', label: 'q5', isInitial: false, isFinal: true, x: 540, y: 200 },
      ],
      transitions: [
        { id: 't0_loop0', from: 'q0', to: 'q0', symbol: '0' },
        { id: 't0_loop1', from: 'q0', to: 'q0', symbol: '1' },
        { id: 't_eps1', from: 'q0', to: 'q1', symbol: 'ε' },
        { id: 't_eps2', from: 'q0', to: 'q3', symbol: 'ε' },
        { id: 't1_2', from: 'q1', to: 'q2', symbol: '0' },
        { id: 't2_5', from: 'q2', to: 'q5', symbol: '1' },
        { id: 't3_4', from: 'q3', to: 'q4', symbol: '1' },
        { id: 't4_5', from: 'q4', to: 'q5', symbol: '0' },
      ],
      description: 'L = { w ∈ {0, 1}* | w ends in "01" or "10" } using ε-branching',
    },
  },
  {
    id: 'dfa-even-zeros',
    title: 'DFA: Even Number of 0s',
    category: 'DFA',
    description: 'Deterministic automaton with 2 states tracking the parity of "0"s. Even is accepting, odd is non-accepting.',
    sampleAcceptedStrings: ['', '1', '00', '11', '010', '1001', '0000'],
    sampleRejectedStrings: ['0', '01', '10', '000', '1011', '0111'],
    automaton: {
      id: 'ex_dfa_even_0',
      name: 'DFA (Even 0s)',
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q_even', label: 'q_even', isInitial: true, isFinal: true, x: 140, y: 180 },
        { id: 'q_odd', label: 'q_odd', isInitial: false, isFinal: false, x: 380, y: 180 },
      ],
      transitions: [
        { id: 't_even_1', from: 'q_even', to: 'q_even', symbol: '1' },
        { id: 't_even_0', from: 'q_even', to: 'q_odd', symbol: '0' },
        { id: 't_odd_1', from: 'q_odd', to: 'q_odd', symbol: '1' },
        { id: 't_odd_0', from: 'q_odd', to: 'q_even', symbol: '0' },
      ],
      description: 'L = { w ∈ {0, 1}* | count_0(w) mod 2 == 0 }',
    },
  },
  {
    id: 'dfa-divisible-by-3',
    title: 'DFA: Binary Number Divisible by 3',
    category: 'DFA',
    description: 'Reads binary numbers MSB to LSB and computes value modulo 3. State q_r represents value % 3 == r.',
    sampleAcceptedStrings: ['0', '11', '110', '1001', '1100', '1111'], // 0, 3, 6, 9, 12, 15
    sampleRejectedStrings: ['1', '10', '100', '101', '111', '1010'], // 1, 2, 4, 5, 7, 10
    automaton: {
      id: 'ex_dfa_div3',
      name: 'DFA (Binary Div by 3)',
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'rem0', label: 'r0', isInitial: true, isFinal: true, x: 100, y: 180 },
        { id: 'rem1', label: 'r1', isInitial: false, isFinal: false, x: 280, y: 100 },
        { id: 'rem2', label: 'r2', isInitial: false, isFinal: false, x: 280, y: 260 },
      ],
      transitions: [
        { id: 't_r0_0', from: 'rem0', to: 'rem0', symbol: '0' },
        { id: 't_r0_1', from: 'rem0', to: 'rem1', symbol: '1' },
        { id: 't_r1_0', from: 'rem1', to: 'rem2', symbol: '0' },
        { id: 't_r1_1', from: 'rem1', to: 'rem0', symbol: '1' },
        { id: 't_r2_0', from: 'rem2', to: 'rem1', symbol: '0' },
        { id: 't_r2_1', from: 'rem2', to: 'rem2', symbol: '1' },
      ],
      description: 'L = { binary representations of n | n ≡ 0 (mod 3) }',
    },
  },
];

