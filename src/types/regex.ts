import { Automaton } from './automata';

export type RegexOperator = '|' | '.' | '*' | '+' | '(' | ')';

export interface RegexToken {
  type: 'OPERAND' | 'UNION' | 'CONCAT' | 'STAR' | 'PLUS' | 'LPAREN' | 'RPAREN';
  value: string;
  position: number;
}

export interface ThompsonStep {
  stepNumber: number;
  token: string;
  operationType: 'SYMBOL' | 'UNION' | 'CONCAT' | 'STAR' | 'PLUS';
  subexpression: string;
  ruleDescription: string;
  explanation: string;
  newStates: string[];
  newTransitions: string[];
  snapshotAutomaton: Automaton;
  activeStateIds: string[];
  activeTransitionIds: string[];
}

export interface ThompsonConstructionResult {
  nfa: Automaton;
  steps: ThompsonStep[];
  postfixTokens: string[];
  alphabet: string[];
}

export interface RegexExample {
  id: string;
  title: string;
  regex: string;
  description: string;
  sampleAccepted: string[];
  sampleRejected: string[];
}
