export type AutomatonType = 'DFA' | 'NFA';

export const EPSILON = 'ε';
export const DEAD_STATE_ID = 'DEAD_STATE';

export interface AutomatonState {
  id: string;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  x?: number;
  y?: number;
}

export interface AutomatonTransition {
  id: string;
  from: string;
  to: string;
  symbol: string; // alphabet symbol or EPSILON ('ε')
}

export interface Automaton {
  id: string;
  name: string;
  type: AutomatonType;
  alphabet: string[]; // e.g. ['0', '1']
  states: AutomatonState[];
  transitions: AutomatonTransition[];
  description?: string;
}

export interface SubsetStep {
  stepNumber: number;
  sourceSubsetName: string; // e.g. "A"
  sourceSubsetStates: string[]; // e.g. ["q0", "q1"]
  symbol: string; // e.g. "0"
  moveSet: string[]; // direct transitions before epsilon-closure
  targetSubsetStates: string[]; // after epsilon-closure
  targetSubsetName: string; // e.g. "B" or "∅ (Trap/Dead)"
  isNewSubset: boolean;
  explanation: string;
  snapshotDfaStates: AutomatonState[];
  snapshotDfaTransitions: AutomatonTransition[];
  activeNfaStates: string[];
  activeNfaTransitions: string[];
}

export interface NfaToDfaResult {
  dfa: Automaton;
  steps: SubsetStep[];
  subsetMap: Record<string, string[]>; // dfaStateId -> array of nfaStateIds
  hasDeadState: boolean;
  summary: {
    initialSubset: string[];
    totalSubsetsExamined: number;
    finalDfaStateCount: number;
    finalDfaTransitionCount: number;
  };
}

export interface SimulationStep {
  stepIndex: number;
  charIndex: number; // -1 for start
  symbolRead: string | null;
  remainingString: string;
  activeStateIds: string[]; // array of current state IDs (1 for DFA, >=0 for NFA)
  activeTransitionIds: string[]; // IDs of transitions traversed in this step
  description: string;
  isEpsilonStep?: boolean;
}

export interface SimulationResult {
  input: string;
  isAccepted: boolean;
  steps: SimulationStep[];
  finalActiveStateIds: string[];
  reason: string;
}

export interface AutomatonValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface AutomatonValidationResult {
  isValid: boolean;
  errors: AutomatonValidationError[];
}

