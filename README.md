# Automata Studio – A Simple Finite Automata Conversion Tool

**Automata Studio** is a clean, reliable, web-based educational tool for university courses in Automata Theory, Formal Languages, and Compiler Design.

The application focuses exclusively on four fundamental Automata Theory conversions:

1. **Module 1: DFA to NFA** (Formal embedding where each transition maps to a singleton set)
2. **Module 2: NFA to DFA** (Rabin-Scott Powerset / Subset Construction with $\varepsilon$-closures)
3. **Module 3: Regular Expression to DFA** (Thompson's Construction followed by Subset Construction)
4. **Module 4: Regular Expression to ε-NFA** (Thompson's inductive construction with $\varepsilon$-moves)

---

## 🚀 Key Modules & Capabilities

### 1. Module 1: DFA to NFA Conversion
- Accepts any user-defined DFA via a simple, structured form or preset examples.
- Preserves all states $Q$, alphabet $\Sigma$, start state $q_0$, and final states $F$.
- Maps each transition $\delta(q, a) = p$ into an NFA singleton set $\delta'(q, a) = \{p\}$.
- Renders the resulting NFA interactive state diagram.
- Renders the resulting NFA transition table with singleton set formatting.

### 2. Module 2: NFA to DFA Conversion
- Accepts any NFA input (supports multiple destinations per symbol and $\varepsilon$-transitions).
- Computes multi-hop $\varepsilon$-closure sets transitively.
- Generates only reachable DFA subset states ($A = \{q_0\}$, $B = \{q_0, q_1\}$, etc.).
- Marks a DFA subset accepting if it contains at least one NFA final state.
- Automatically synthesizes a dead/trap state ($\emptyset$) if needed for transition completeness.
- Renders the resulting DFA state diagram and transition table.

### 3. Module 3: Regular Expression to DFA
- Accepts regular expressions supporting:
  - `|` (Union)
  - `*` (Kleene Star)
  - `.` (Explicit concatenation)
  - Implicit concatenation (e.g. `ab` $\to$ `a.b`)
  - `()` (Grouping)
  - `ε` (Empty string)
- Follows standard operator precedence: Kleene star > Concatenation > Union.
- Converts Regex $\to$ $\varepsilon$-NFA via Thompson's Construction $\to$ DFA via Subset Construction.
- Displays theoretical metrics, resulting DFA state diagram, and transition table.

### 4. Module 4: Regular Expression to ε-NFA
- Implements Thompson's Construction Algorithm:
  - Base symbol rule (2 states, 1 transition)
  - Union rule (new start/final states + 4 $\varepsilon$-transitions)
  - Concatenation rule (bridges sub-NFAs with an $\varepsilon$-transition)
  - Kleene star rule (new start/final states + 4 $\varepsilon$-transitions)
- Displays all generated states, start arrow, accepting double circles, and $\varepsilon$ edges.
- Renders the resulting $\varepsilon$-NFA transition table with an explicit $\varepsilon$ column.

---

## 🛠️ Technology Stack

- **React 19 & TypeScript 5.7** (Strict Mode, 0 errors)
- **Vite 6** (Fast local bundler)
- **Tailwind CSS** (Modern, dark-themed responsive UI)
- **@xyflow/react** (Interactive diagrams with pan, zoom, fit-view, and auto-layout)
- **Lucide React** (Icons)
- **Vitest** (Automated test runner: 72/72 tests passing)

---

## 💻 Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (72 unit & QA tests)
npm test -- --run

# 3. Build for production
npm run build

# 4. Start local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your web browser.
