import { Automaton, AutomatonState, AutomatonTransition, EPSILON } from '../types/automata';
import { ThompsonConstructionResult, ThompsonStep } from '../types/regex';
import { parseRegex } from './regexParser';

interface Fragment {
  startId: string;
  finalId: string;
  states: AutomatonState[];
  transitions: AutomatonTransition[];
  subexpression: string;
}

/**
 * Assigns clean left-to-right layered coordinates to states in a Thompson NFA.
 */
function layoutThompsonStates(
  states: AutomatonState[],
  transitions: AutomatonTransition[],
  startId: string
): void {
  // Compute BFS distance from startId to determine horizontal layers
  const levels = new Map<string, number>();
  const visited = new Set<string>();
  const queue: Array<{ id: string; level: number }> = [{ id: startId, level: 0 }];

  levels.set(startId, 0);
  visited.add(startId);

  // Build adjacency
  const adj = new Map<string, string[]>();
  for (const s of states) adj.set(s.id, []);
  for (const t of transitions) {
    if (adj.has(t.from)) {
      adj.get(t.from)!.push(t.to);
    }
  }

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const neighbors = adj.get(id) || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        visited.add(next);
        levels.set(next, level + 1);
        queue.push({ id: next, level: level + 1 });
      }
    }
  }

  // Handle any states not reached via forward traversal
  let maxLevel = 0;
  levels.forEach((l) => {
    if (l > maxLevel) maxLevel = l;
  });

  for (const s of states) {
    if (!levels.has(s.id)) {
      maxLevel++;
      levels.set(s.id, maxLevel);
    }
  }

  // Group states by level
  const statesByLevel = new Map<number, string[]>();
  levels.forEach((lvl, id) => {
    const list = statesByLevel.get(lvl) || [];
    list.push(id);
    statesByLevel.set(lvl, list);
  });

  // Assign x, y coordinates
  const levelSpacing = 160;
  const rowSpacing = 95;
  const startX = 80;
  const baseY = 220;

  statesByLevel.forEach((stateIds, lvl) => {
    const totalInLevel = stateIds.length;
    stateIds.forEach((id, rowIdx) => {
      const stateObj = states.find((s) => s.id === id);
      if (stateObj) {
        stateObj.x = startX + lvl * levelSpacing;
        // Center vertically around baseY
        stateObj.y = Math.round(baseY + (rowIdx - (totalInLevel - 1) / 2) * rowSpacing);
      }
    });
  });
}

/**
 * Executes Thompson's Construction Algorithm to convert a regular expression
 * into an equivalent epsilon-NFA with step-by-step educational snapshots.
 */
export function buildThompsonNfa(regexInput: string): ThompsonConstructionResult {
  const parseResult = parseRegex(regexInput);
  if (!parseResult.isValid) {
    throw new Error(parseResult.error || 'Invalid regular expression');
  }

  const { postfix, alphabet } = parseResult;
  let stateIdCounter = 0;
  let transIdCounter = 0;

  const createState = (): AutomatonState => {
    const id = `q${stateIdCounter}`;
    const label = `q${stateIdCounter}`;
    stateIdCounter++;
    return { id, label, isInitial: false, isFinal: false };
  };

  const createTransition = (from: string, to: string, symbol: string): AutomatonTransition => {
    const id = `tr_${transIdCounter++}_${from}_${to}`;
    return { id, from, to, symbol };
  };

  const stack: Fragment[] = [];
  const steps: ThompsonStep[] = [];
  let stepNumber = 1;

  for (const token of postfix) {
    if (token === '*') {
      // RULE 4: Kleene Star
      if (stack.length < 1) {
        throw new Error('Malformed expression: Kleene Star has no operand.');
      }
      const frag = stack.pop()!;
      const newStart = createState();
      const newFinal = createState();

      // Clear existing initial/final flags
      frag.states.forEach((s) => {
        s.isInitial = false;
        s.isFinal = false;
      });

      newStart.isInitial = true;
      newFinal.isFinal = true;

      // 4 Epsilon transitions:
      // 1. newStart -> newFinal (zero occurrences)
      // 2. newStart -> frag.startId (enter sub-NFA)
      // 3. frag.finalId -> frag.startId (loop back for repeated matches)
      // 4. frag.finalId -> newFinal (exit to final state)
      const t1 = createTransition(newStart.id, newFinal.id, EPSILON);
      const t2 = createTransition(newStart.id, frag.startId, EPSILON);
      const t3 = createTransition(frag.finalId, frag.startId, EPSILON);
      const t4 = createTransition(frag.finalId, newFinal.id, EPSILON);

      const combinedStates = [newStart, ...frag.states, newFinal];
      const combinedTransitions = [...frag.transitions, t1, t2, t3, t4];
      const newSubexpr = `(${frag.subexpression})*`;

      const newFrag: Fragment = {
        startId: newStart.id,
        finalId: newFinal.id,
        states: combinedStates,
        transitions: combinedTransitions,
        subexpression: newSubexpr,
      };
      stack.push(newFrag);

      // Snapshot for step visualizer
      const snapshotStates = JSON.parse(JSON.stringify(combinedStates));
      const snapshotTransitions = JSON.parse(JSON.stringify(combinedTransitions));
      layoutThompsonStates(snapshotStates, snapshotTransitions, newStart.id);

      steps.push({
        stepNumber: stepNumber++,
        token: '*',
        operationType: 'STAR',
        subexpression: newSubexpr,
        ruleDescription: "Thompson Rule 4: Kleene Star (*)",
        explanation: `Applied Kleene Star to subexpression "${frag.subexpression}":\n` +
          `• Created new start state ${newStart.label} and new accepting state ${newFinal.label}.\n` +
          `• Added ε-transition (${newStart.label} → ${newFinal.label}) to allow 0 repetitions (empty match).\n` +
          `• Added ε-transition (${newStart.label} → ${frag.startId}) to enter the sub-NFA.\n` +
          `• Added loopback ε-transition (${frag.finalId} → ${frag.startId}) to repeat the pattern 1 or more times.\n` +
          `• Added ε-transition (${frag.finalId} → ${newFinal.label}) to transition into the accepting state.`,
        newStates: [newStart.label, newFinal.label],
        newTransitions: [t1.id, t2.id, t3.id, t4.id],
        snapshotAutomaton: {
          id: `step_${stepNumber}`,
          name: `NFA for ${newSubexpr}`,
          type: 'NFA',
          alphabet,
          states: snapshotStates,
          transitions: snapshotTransitions,
        },
        activeStateIds: [newStart.id, newFinal.id, frag.startId, frag.finalId],
        activeTransitionIds: [t1.id, t2.id, t3.id, t4.id],
      });
    } else if (token === '+') {
      // Kleene Plus (One-or-more)
      if (stack.length < 1) {
        throw new Error('Malformed expression: Plus (+) has no operand.');
      }
      const frag = stack.pop()!;
      const newStart = createState();
      const newFinal = createState();

      frag.states.forEach((s) => {
        s.isInitial = false;
        s.isFinal = false;
      });

      newStart.isInitial = true;
      newFinal.isFinal = true;

      // 3 Epsilon transitions (no direct bypass from newStart to newFinal):
      const t1 = createTransition(newStart.id, frag.startId, EPSILON);
      const t2 = createTransition(frag.finalId, frag.startId, EPSILON);
      const t3 = createTransition(frag.finalId, newFinal.id, EPSILON);

      const combinedStates = [newStart, ...frag.states, newFinal];
      const combinedTransitions = [...frag.transitions, t1, t2, t3];
      const newSubexpr = `(${frag.subexpression})+`;

      const newFrag: Fragment = {
        startId: newStart.id,
        finalId: newFinal.id,
        states: combinedStates,
        transitions: combinedTransitions,
        subexpression: newSubexpr,
      };
      stack.push(newFrag);

      const snapshotStates = JSON.parse(JSON.stringify(combinedStates));
      const snapshotTransitions = JSON.parse(JSON.stringify(combinedTransitions));
      layoutThompsonStates(snapshotStates, snapshotTransitions, newStart.id);

      steps.push({
        stepNumber: stepNumber++,
        token: '+',
        operationType: 'PLUS',
        subexpression: newSubexpr,
        ruleDescription: "Thompson Extension: Positive Closure (+)",
        explanation: `Applied Positive Closure to subexpression "${frag.subexpression}":\n` +
          `• Created new start state ${newStart.label} and new accepting state ${newFinal.label}.\n` +
          `• Added ε-transition (${newStart.label} → ${frag.startId}) into sub-NFA.\n` +
          `• Added loopback ε-transition (${frag.finalId} → ${frag.startId}) for subsequent repetitions.\n` +
          `• Added ε-transition (${frag.finalId} → ${newFinal.label}) into the accepting state.\n` +
          `• Zero-occurrence bypass is omitted, requiring at least 1 match.`,
        newStates: [newStart.label, newFinal.label],
        newTransitions: [t1.id, t2.id, t3.id],
        snapshotAutomaton: {
          id: `step_${stepNumber}`,
          name: `NFA for ${newSubexpr}`,
          type: 'NFA',
          alphabet,
          states: snapshotStates,
          transitions: snapshotTransitions,
        },
        activeStateIds: [newStart.id, newFinal.id, frag.startId, frag.finalId],
        activeTransitionIds: [t1.id, t2.id, t3.id],
      });
    } else if (token === '.') {
      // RULE 3: Concatenation
      if (stack.length < 2) {
        throw new Error('Malformed expression: Concatenation (.) requires two operands.');
      }
      const fragB = stack.pop()!;
      const fragA = stack.pop()!;

      // Connect final of A to initial of B with an epsilon transition
      const connectTrans = createTransition(fragA.finalId, fragB.startId, EPSILON);

      fragA.states.forEach((s) => {
        if (s.id === fragA.startId) s.isInitial = true;
        s.isFinal = false;
      });

      fragB.states.forEach((s) => {
        s.isInitial = false;
        if (s.id === fragB.finalId) s.isFinal = true;
      });

      const combinedStates = [...fragA.states, ...fragB.states];
      const combinedTransitions = [...fragA.transitions, ...fragB.transitions, connectTrans];
      const newSubexpr = `${fragA.subexpression}${fragB.subexpression}`;

      const newFrag: Fragment = {
        startId: fragA.startId,
        finalId: fragB.finalId,
        states: combinedStates,
        transitions: combinedTransitions,
        subexpression: newSubexpr,
      };
      stack.push(newFrag);

      const snapshotStates = JSON.parse(JSON.stringify(combinedStates));
      const snapshotTransitions = JSON.parse(JSON.stringify(combinedTransitions));
      layoutThompsonStates(snapshotStates, snapshotTransitions, fragA.startId);

      steps.push({
        stepNumber: stepNumber++,
        token: '.',
        operationType: 'CONCAT',
        subexpression: newSubexpr,
        ruleDescription: "Thompson Rule 3: Concatenation (·)",
        explanation: `Concatenated sub-NFA "${fragA.subexpression}" with sub-NFA "${fragB.subexpression}":\n` +
          `• Added connecting ε-transition (${fragA.finalId} → ${fragB.startId}).\n` +
          `• State ${fragA.startId} remains the overall start state.\n` +
          `• State ${fragB.finalId} becomes the overall accepting state.\n` +
          `• State ${fragA.finalId} is now an internal non-accepting intermediate state.`,
        newStates: [],
        newTransitions: [connectTrans.id],
        snapshotAutomaton: {
          id: `step_${stepNumber}`,
          name: `NFA for ${newSubexpr}`,
          type: 'NFA',
          alphabet,
          states: snapshotStates,
          transitions: snapshotTransitions,
        },
        activeStateIds: [fragA.finalId, fragB.startId],
        activeTransitionIds: [connectTrans.id],
      });
    } else if (token === '|') {
      // RULE 2: Union
      if (stack.length < 2) {
        throw new Error('Malformed expression: Union (|) requires two operands.');
      }
      const fragB = stack.pop()!;
      const fragA = stack.pop()!;

      const newStart = createState();
      const newFinal = createState();

      fragA.states.forEach((s) => {
        s.isInitial = false;
        s.isFinal = false;
      });
      fragB.states.forEach((s) => {
        s.isInitial = false;
        s.isFinal = false;
      });

      newStart.isInitial = true;
      newFinal.isFinal = true;

      // 4 Epsilon transitions:
      // newStart -> A.startId, newStart -> B.startId
      // A.finalId -> newFinal, B.finalId -> newFinal
      const t1 = createTransition(newStart.id, fragA.startId, EPSILON);
      const t2 = createTransition(newStart.id, fragB.startId, EPSILON);
      const t3 = createTransition(fragA.finalId, newFinal.id, EPSILON);
      const t4 = createTransition(fragB.finalId, newFinal.id, EPSILON);

      const combinedStates = [newStart, ...fragA.states, ...fragB.states, newFinal];
      const combinedTransitions = [...fragA.transitions, ...fragB.transitions, t1, t2, t3, t4];
      const newSubexpr = `(${fragA.subexpression}|${fragB.subexpression})`;

      const newFrag: Fragment = {
        startId: newStart.id,
        finalId: newFinal.id,
        states: combinedStates,
        transitions: combinedTransitions,
        subexpression: newSubexpr,
      };
      stack.push(newFrag);

      const snapshotStates = JSON.parse(JSON.stringify(combinedStates));
      const snapshotTransitions = JSON.parse(JSON.stringify(combinedTransitions));
      layoutThompsonStates(snapshotStates, snapshotTransitions, newStart.id);

      steps.push({
        stepNumber: stepNumber++,
        token: '|',
        operationType: 'UNION',
        subexpression: newSubexpr,
        ruleDescription: "Thompson Rule 2: Union / Alternation (|)",
        explanation: `Formed union of "${fragA.subexpression}" and "${fragB.subexpression}":\n` +
          `• Created new start state ${newStart.label} and new accepting state ${newFinal.label}.\n` +
          `• Added branching ε-transitions from ${newStart.label} to ${fragA.startId} and ${fragB.startId}.\n` +
          `• Added joining ε-transitions from ${fragA.finalId} and ${fragB.finalId} into ${newFinal.label}.\n` +
          `• Non-deterministically tests both alternative language branches in parallel.`,
        newStates: [newStart.label, newFinal.label],
        newTransitions: [t1.id, t2.id, t3.id, t4.id],
        snapshotAutomaton: {
          id: `step_${stepNumber}`,
          name: `NFA for ${newSubexpr}`,
          type: 'NFA',
          alphabet,
          states: snapshotStates,
          transitions: snapshotTransitions,
        },
        activeStateIds: [newStart.id, newFinal.id, fragA.startId, fragB.startId, fragA.finalId, fragB.finalId],
        activeTransitionIds: [t1.id, t2.id, t3.id, t4.id],
      });
    } else {
      // RULE 1: Base Symbol (or ε)
      const s0 = createState();
      const s1 = createState();
      s0.isInitial = true;
      s1.isFinal = true;

      const trans = createTransition(s0.id, s1.id, token);
      const frag: Fragment = {
        startId: s0.id,
        finalId: s1.id,
        states: [s0, s1],
        transitions: [trans],
        subexpression: token,
      };
      stack.push(frag);

      const snapshotStates = JSON.parse(JSON.stringify([s0, s1]));
      const snapshotTransitions = JSON.parse(JSON.stringify([trans]));
      layoutThompsonStates(snapshotStates, snapshotTransitions, s0.id);

      const isEps = token === EPSILON;
      steps.push({
        stepNumber: stepNumber++,
        token: token,
        operationType: 'SYMBOL',
        subexpression: token,
        ruleDescription: isEps ? "Thompson Rule 1: Empty String (ε)" : `Thompson Rule 1: Base Symbol '${token}'`,
        explanation: isEps
          ? `Constructed base NFA for empty string ε:\n` +
            `• Created start state ${s0.label} and final state ${s1.label}.\n` +
            `• Added single ε-transition: δ(${s0.label}, ε) = {${s1.label}}.\n` +
            `• Transitions without consuming any input character.`
          : `Constructed base NFA for symbol '${token}':\n` +
            `• Created start state ${s0.label} and final state ${s1.label}.\n` +
            `• Added single transition: δ(${s0.label}, '${token}') = {${s1.label}}.\n` +
            `• Consumes symbol '${token}' and moves to accepting state.`,
        newStates: [s0.label, s1.label],
        newTransitions: [trans.id],
        snapshotAutomaton: {
          id: `step_${stepNumber}`,
          name: `NFA for ${token}`,
          type: 'NFA',
          alphabet: isEps ? alphabet : Array.from(new Set([...alphabet, token])),
          states: snapshotStates,
          transitions: snapshotTransitions,
        },
        activeStateIds: [s0.id, s1.id],
        activeTransitionIds: [trans.id],
      });
    }
  }

  if (stack.length !== 1) {
    throw new Error('Malformed expression: Unbalanced operations in expression.');
  }

  const finalFragment = stack[0];
  const finalStates = JSON.parse(JSON.stringify(finalFragment.states));
  const finalTransitions = JSON.parse(JSON.stringify(finalFragment.transitions));
  layoutThompsonStates(finalStates, finalTransitions, finalFragment.startId);

  const cleanAlphabet = Array.from(new Set(alphabet)).filter((s) => s !== EPSILON);

  const completeNfa: Automaton = {
    id: `nfa_thompson_${Date.now()}`,
    name: `Thompson NFA for "${regexInput}"`,
    type: 'NFA',
    alphabet: cleanAlphabet.length > 0 ? cleanAlphabet : ['a', 'b'],
    states: finalStates,
    transitions: finalTransitions,
    description: `Constructed using Thompson's Algorithm from regular expression: ${regexInput}`,
  };

  return {
    nfa: completeNfa,
    steps,
    postfixTokens: postfix,
    alphabet: cleanAlphabet,
  };
}
