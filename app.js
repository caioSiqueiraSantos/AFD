/**
 * SIMULADOR DE AUTÔMATO FINITO DETERMINÍSTICO (AFD)
 * Implementação formal e determinística em JavaScript puro.
 * Padrão científico/acadêmico.
 */

// ============================================================================
// 1. MODELOS FORMAIS DE AUTÔMATOS (PRESETS ACADÊMICOS)
// ============================================================================
const AUTOMATA_PRESETS = {
  ends01: {
    id: "ends01",
    name: "L₁ = { w ∈ {0,1}* | w termina com '01' }",
    description: "Reconhecimento de sufixo binário fixo '01'.",
    alphabet: ["0", "1"],
    states: [
      { id: "q0", label: "q₀", sublabel: "(não-01)", x: 150, y: 170, isInitial: true, isFinal: false },
      { id: "q1", label: "q₁", sublabel: "(termina '0')", x: 370, y: 170, isInitial: false, isFinal: false },
      { id: "q2", label: "q₂", sublabel: "(termina '01')", x: 590, y: 170, isInitial: false, isFinal: true }
    ],
    initialState: "q0",
    finalStates: ["q2"],
    transitions: [
      { from: "q0", to: "q1", symbol: "0", curveOffset: -30 },
      { from: "q0", to: "q0", symbol: "1", loopDir: "top" },
      { from: "q1", to: "q1", symbol: "0", loopDir: "top" },
      { from: "q1", to: "q2", symbol: "1", curveOffset: -25 },
      { from: "q2", to: "q1", symbol: "0", curveOffset: -25 },
      { from: "q2", to: "q0", symbol: "1", curveOffset: 65 }
    ],
    examples: [
      { text: "01", valid: true },
      { text: "101", valid: true },
      { text: "001", valid: true },
      { text: "1101", valid: true },
      { text: "00001", valid: true },
      { text: "0", valid: false },
      { text: "1", valid: false },
      { text: "10", valid: false },
      { text: "11", valid: false },
      { text: "100", valid: false }
    ]
  },

  mod3: {
    id: "mod3",
    name: "L₂ = { w ∈ {0,1}* | bin(w) ≡ 0 (mod 3) }",
    description: "Reconhecimento de inteiros binários divisíveis por 3 via resto de divisão.",
    alphabet: ["0", "1"],
    states: [
      { id: "R0", label: "R₀", sublabel: "(resto 0)", x: 210, y: 120, isInitial: true, isFinal: true },
      { id: "R1", label: "R₁", sublabel: "(resto 1)", x: 530, y: 120, isInitial: false, isFinal: false },
      { id: "R2", label: "R₂", sublabel: "(resto 2)", x: 370, y: 270, isInitial: false, isFinal: false }
    ],
    initialState: "R0",
    finalStates: ["R0"],
    transitions: [
      { from: "R0", to: "R0", symbol: "0", loopDir: "top" },
      { from: "R0", to: "R1", symbol: "1", curveOffset: -25 },
      { from: "R1", to: "R0", symbol: "1", curveOffset: -25 },
      { from: "R1", to: "R2", symbol: "0", curveOffset: -25 },
      { from: "R2", to: "R1", symbol: "0", curveOffset: -25 },
      { from: "R2", to: "R2", symbol: "1", loopDir: "bottom" }
    ],
    examples: [
      { text: "0", valid: true },
      { text: "11", valid: true },
      { text: "110", valid: true },
      { text: "1001", valid: true },
      { text: "1", valid: false },
      { text: "10", valid: false },
      { text: "100", valid: false }
    ]
  },

  evenZeros: {
    id: "evenZeros",
    name: "L₃ = { w ∈ {0,1}* | |w|₀ é par }",
    description: "Reconhecimento de paridade na contagem do símbolo '0'.",
    alphabet: ["0", "1"],
    states: [
      { id: "qPar", label: "q_par", sublabel: "(zeros pares)", x: 250, y: 170, isInitial: true, isFinal: true },
      { id: "qImp", label: "q_ímp", sublabel: "(zeros ímpares)", x: 490, y: 170, isInitial: false, isFinal: false }
    ],
    initialState: "qPar",
    finalStates: ["qPar"],
    transitions: [
      { from: "qPar", to: "qPar", symbol: "1", loopDir: "top" },
      { from: "qPar", to: "qImp", symbol: "0", curveOffset: -30 },
      { from: "qImp", to: "qPar", symbol: "0", curveOffset: -30 },
      { from: "qImp", to: "qImp", symbol: "1", loopDir: "top" }
    ],
    examples: [
      { text: "111", valid: true },
      { text: "00", valid: true },
      { text: "10101", valid: true },
      { text: "0", valid: false },
      { text: "000", valid: false },
      { text: "101", valid: false }
    ]
  }
};

// ============================================================================
// 2. VARIÁVEIS DE ESTADO DA MÁQUINA
// ============================================================================
let currentDFA = AUTOMATA_PRESETS.ends01;
let currentString = "";
let tape = [];
let headIndex = 0;
let currentState = "";
let isAutoPlaying = false;
let stepTimer = null;
let animationSpeed = 600;

// ============================================================================
// 3. REFERÊNCIAS DO DOCUMENTO (DOM)
// ============================================================================
const dom = {
  automatonSelect: document.getElementById("automatonSelect"),
  alphabetBadge: document.getElementById("alphabetBadge"),
  tupleTable: document.getElementById("tupleTable"),
  dfaSvg: document.getElementById("dfaSvg"),
  statesLayer: document.getElementById("statesLayer"),
  transitionsLayer: document.getElementById("transitionsLayer"),
  inputString: document.getElementById("inputString"),
  btnLoad: document.getElementById("btnLoad"),
  btnStep: document.getElementById("btnStep"),
  btnPlay: document.getElementById("btnPlay"),
  btnReset: document.getElementById("btnReset"),
  btnClearLog: document.getElementById("btnClearLog"),
  speedRange: document.getElementById("speedRange"),
  speedValue: document.getElementById("speedValue"),
  quickExamplesList: document.getElementById("quickExamplesList"),
  tapeCells: document.getElementById("tapeCells"),
  tapeStatus: document.getElementById("tapeStatus"),
  verdictBox: document.getElementById("verdictBox"),
  verdictText: document.getElementById("verdictText"),
  verdictDetail: document.getElementById("verdictDetail"),
  transitionTable: document.getElementById("transitionTable"),
  executionLog: document.getElementById("executionLog")
};

// ============================================================================
// 4. INICIALIZAÇÃO
// ============================================================================
function init() {
  setupEventListeners();
  loadAutomaton("ends01");
}

function setupEventListeners() {
  dom.automatonSelect.addEventListener("change", (e) => {
    loadAutomaton(e.target.value);
  });

  dom.btnLoad.addEventListener("click", () => {
    setupInputString(dom.inputString.value.trim());
  });

  dom.inputString.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      setupInputString(dom.inputString.value.trim());
    }
  });

  dom.btnStep.addEventListener("click", () => {
    pauseAutoPlay();
    step();
  });

  dom.btnPlay.addEventListener("click", toggleAutoPlay);
  dom.btnReset.addEventListener("click", resetSimulation);
  dom.btnClearLog.addEventListener("click", clearLog);

  dom.speedRange.addEventListener("input", (e) => {
    animationSpeed = parseInt(e.target.value, 10);
    dom.speedValue.textContent = `${animationSpeed} ms`;
  });
}

// ============================================================================
// 5. CARREGAMENTO DO MODELO TEÓRICO
// ============================================================================
function loadAutomaton(presetKey) {
  pauseAutoPlay();
  currentDFA = AUTOMATA_PRESETS[presetKey];
  
  dom.alphabetBadge.textContent = `Σ = { ${currentDFA.alphabet.join(", ")} }`;

  renderFormalTuple();
  renderSvgGraph();
  renderTransitionTable();
  renderQuickExamples();

  const defaultSample = currentDFA.examples[0].text;
  dom.inputString.value = defaultSample;
  setupInputString(defaultSample);

  logMessage(`Modelo carregado: ${currentDFA.name}`, "normal");
}

function renderFormalTuple() {
  const qStr = `{ ${currentDFA.states.map(s => s.label).join(", ")} }`;
  const sigmaStr = `{ ${currentDFA.alphabet.join(", ")} }`;
  const q0Str = currentDFA.states.find(s => s.id === currentDFA.initialState)?.label || currentDFA.initialState;
  const fStr = `{ ${currentDFA.finalStates.map(id => currentDFA.states.find(s => s.id === id)?.label).join(", ")} }`;

  dom.tupleTable.innerHTML = `
    <tbody>
      <tr>
        <td class="tuple-term">Conjunto de Estados (Q)</td>
        <td class="tuple-def">${qStr}</td>
      </tr>
      <tr>
        <td class="tuple-term">Alfabeto de Entrada (&Sigma;)</td>
        <td class="tuple-def">${sigmaStr}</td>
      </tr>
      <tr>
        <td class="tuple-term">Estado Inicial (q₀)</td>
        <td class="tuple-def">${q0Str}</td>
      </tr>
      <tr>
        <td class="tuple-term">Estados de Aceitação (F)</td>
        <td class="tuple-def">${fStr}</td>
      </tr>
    </tbody>
  `;
}

function renderQuickExamples() {
  dom.quickExamplesList.innerHTML = "";
  currentDFA.examples.forEach(ex => {
    const btn = document.createElement("button");
    btn.className = "ex-btn";
    btn.textContent = `"${ex.text}" [${ex.valid ? "Aceita" : "Rejeita"}]`;
    btn.title = `Carregar cadeia w = "${ex.text}"`;
    btn.addEventListener("click", () => {
      dom.inputString.value = ex.text;
      setupInputString(ex.text);
    });
    dom.quickExamplesList.appendChild(btn);
  });
}

function renderTransitionTable() {
  let html = `<thead><tr><th>&delta;</th>`;
  currentDFA.alphabet.forEach(sym => {
    html += `<th>símbolo '${sym}'</th>`;
  });
  html += `</tr></thead><tbody>`;

  currentDFA.states.forEach(st => {
    const isStart = st.id === currentDFA.initialState ? "→ " : "";
    const isFinal = currentDFA.finalStates.includes(st.id) ? " *" : "";
    html += `<tr id="row-${st.id}"><td style="font-weight:bold; background-color:#f5f5f5;">${isStart}${st.label}${isFinal}</td>`;

    currentDFA.alphabet.forEach(sym => {
      const tr = currentDFA.transitions.find(t => t.from === st.id && t.symbol === sym);
      const targetState = tr ? currentDFA.states.find(s => s.id === tr.to)?.label : "—";
      const cellId = `cell-${st.id}-${sym}`;
      html += `<td id="${cellId}">${targetState}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody>`;
  dom.transitionTable.innerHTML = html;
}

// ============================================================================
// 6. RENDERIZAÇÃO VETORIAL DO GRAFO (ESTILO ARTIGO CIENTÍFICO)
// ============================================================================
function renderSvgGraph() {
  dom.statesLayer.innerHTML = "";
  dom.transitionsLayer.innerHTML = "";

  const NODE_RADIUS = 32;

  // Unifica rótulos de transição com mesma origem e destino
  const groupedTransitions = [];
  currentDFA.transitions.forEach(tr => {
    const existing = groupedTransitions.find(g => g.from === tr.from && g.to === tr.to && g.curveOffset === tr.curveOffset && g.loopDir === tr.loopDir);
    if (existing) {
      existing.symbols.push(tr.symbol);
    } else {
      groupedTransitions.push({
        ...tr,
        symbols: [tr.symbol]
      });
    }
  });

  // Desenhar Arestas (Linhas / Curvas pretas acadêmicas)
  groupedTransitions.forEach((tr) => {
    const fromState = currentDFA.states.find(s => s.id === tr.from);
    const toState = currentDFA.states.find(s => s.id === tr.to);
    const trId = `trans-${tr.from}-${tr.to}-${tr.symbols.join("_")}`;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("id", trId);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "transition-path");
    path.setAttribute("marker-end", "url(#arrow)");

    let d = "";
    let labelX = 0;
    let labelY = 0;

    if (tr.from === tr.to) {
      // Auto-loop
      const isTop = tr.loopDir !== "bottom";
      const sign = isTop ? -1 : 1;
      const x = fromState.x;
      const y = fromState.y + sign * NODE_RADIUS;

      const p1x = x - 16;
      const p1y = y;
      const cp1x = x - 35;
      const cp1y = y + sign * 55;
      const cp2x = x + 35;
      const cp2y = y + sign * 55;
      const p2x = x + 16;
      const p2y = y;

      d = `M ${p1x} ${p1y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2x} ${p2y}`;
      labelX = x;
      labelY = y + sign * 48;
    } else {
      // Entre nós distintos
      const dx = toState.x - fromState.x;
      const dy = toState.y - fromState.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const nx = dx / dist;
      const ny = dy / dist;
      const perpX = -ny;
      const perpY = nx;

      const offset = tr.curveOffset || 0;
      const midX = (fromState.x + toState.x) / 2 + perpX * offset;
      const midY = (fromState.y + toState.y) / 2 + perpY * offset;

      const startX = fromState.x + nx * NODE_RADIUS;
      const startY = fromState.y + ny * NODE_RADIUS;
      const endX = toState.x - nx * NODE_RADIUS;
      const endY = toState.y - ny * NODE_RADIUS;

      if (offset === 0) {
        d = `M ${startX} ${startY} L ${endX} ${endY}`;
        labelX = midX + perpX * 10;
        labelY = midY + perpY * 10;
      } else {
        d = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        labelX = 0.25 * startX + 0.5 * midX + 0.25 * endX;
        labelY = 0.25 * startY + 0.5 * midY + 0.25 * endY;
      }
    }

    path.setAttribute("d", d);
    g.appendChild(path);

    // Caixa de fundo simples do rótulo
    const labelText = tr.symbols.join(", ");
    const textWidth = Math.max(18, labelText.length * 8 + 8);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("class", "transition-label-bg");
    rect.setAttribute("x", labelX - textWidth / 2);
    rect.setAttribute("y", labelY - 9);
    rect.setAttribute("width", textWidth);
    rect.setAttribute("height", 18);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("class", "transition-label-text");
    text.setAttribute("x", labelX);
    text.setAttribute("y", labelY);
    text.textContent = labelText;

    g.appendChild(rect);
    g.appendChild(text);
    dom.transitionsLayer.appendChild(g);
  });

  // Desenhar Estados (Círculos pretos nítidos)
  currentDFA.states.forEach(st => {
    const isFinal = currentDFA.finalStates.includes(st.id);
    const isInitial = st.id === currentDFA.initialState;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "state-node");
    g.setAttribute("id", `node-${st.id}`);

    // Seta apontando para estado inicial
    if (isInitial) {
      const startLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      startLine.setAttribute("x1", st.x - 55);
      startLine.setAttribute("y1", st.y);
      startLine.setAttribute("x2", st.x - NODE_RADIUS - 2);
      startLine.setAttribute("y2", st.y);
      startLine.setAttribute("stroke", "#000000");
      startLine.setAttribute("stroke-width", "1.8");
      startLine.setAttribute("marker-end", "url(#arrowStart)");
      g.appendChild(startLine);

      const startText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      startText.setAttribute("x", st.x - 58);
      startText.setAttribute("y", st.y - 4);
      startText.setAttribute("fill", "#000000");
      startText.setAttribute("font-size", "10px");
      startText.setAttribute("font-family", "var(--font-mono)");
      startText.setAttribute("text-anchor", "end");
      startText.textContent = "início";
      g.appendChild(startText);
    }

    // Círculo principal
    const mainCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    mainCircle.setAttribute("class", "state-main-circle");
    mainCircle.setAttribute("cx", st.x);
    mainCircle.setAttribute("cy", st.y);
    mainCircle.setAttribute("r", NODE_RADIUS);
    g.appendChild(mainCircle);

    // Círculo concêntrico para aceitação
    if (isFinal) {
      const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      innerCircle.setAttribute("cx", st.x);
      innerCircle.setAttribute("cy", st.y);
      innerCircle.setAttribute("r", NODE_RADIUS - 5);
      innerCircle.setAttribute("fill", "transparent");
      innerCircle.setAttribute("stroke", "#000000");
      innerCircle.setAttribute("stroke-width", "1.5");
      g.appendChild(innerCircle);
    }

    // Rótulo matemático do estado
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", st.x);
    text.setAttribute("y", st.sublabel ? st.y - 2 : st.y + 5);
    text.setAttribute("text-anchor", "middle");
    text.textContent = st.label;
    g.appendChild(text);

    if (st.sublabel) {
      const sub = document.createElementNS("http://www.w3.org/2000/svg", "text");
      sub.setAttribute("class", "state-sublabel");
      sub.setAttribute("x", st.x);
      sub.setAttribute("y", st.y + 14);
      sub.setAttribute("text-anchor", "middle");
      sub.textContent = st.sublabel;
      g.appendChild(sub);
    }

    dom.statesLayer.appendChild(g);
  });
}

// ============================================================================
// 7. MOTOR DE PROCESSAMENTO DETERMINÍSTICO
// ============================================================================
function setupInputString(str) {
  pauseAutoPlay();

  for (let ch of str) {
    if (!currentDFA.alphabet.includes(ch)) {
      alert(`Símbolo inválido '${ch}'. O alfabeto aceito é Σ = { ${currentDFA.alphabet.join(", ")} }`);
      return;
    }
  }

  currentString = str;
  tape = str.split("");
  headIndex = 0;
  currentState = currentDFA.initialState;

  renderTape();
  highlightActiveState(currentState);
  clearActiveTransitions();
  updateTableHighlights(currentState, null);

  setVerdict("normal", "Pronto para Execução", `Cadeia carregada: w = "${currentString}" | Estado inicial: ${getStateLabel(currentState)}`);
  logMessage(`Cadeia "${currentString}" carregada (${tape.length} símbolos).`, "normal");
}

function renderTape() {
  dom.tapeCells.innerHTML = "";
  if (tape.length === 0) {
    dom.tapeCells.innerHTML = `<div class="tape-cell" style="width:auto; padding:0 8px;">&epsilon; (vazia)</div>`;
    dom.tapeStatus.textContent = "Posição do ponteiro: 0 (fim de cadeia)";
    return;
  }

  tape.forEach((sym, idx) => {
    const cell = document.createElement("div");
    cell.id = `tape-cell-${idx}`;
    cell.className = "tape-cell";
    cell.textContent = sym;

    if (idx < headIndex) {
      cell.classList.add("processed");
    } else if (idx === headIndex) {
      cell.classList.add("current");
    }

    dom.tapeCells.appendChild(cell);
  });

  const activeCell = document.getElementById(`tape-cell-${headIndex}`);
  if (activeCell) {
    activeCell.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  dom.tapeStatus.textContent = `Posição do ponteiro: índice ${headIndex} de ${tape.length} ${headIndex < tape.length ? `[símbolo atual: '${tape[headIndex]}']` : '[fim de cadeia]'}`;
}

function step() {
  if (headIndex >= tape.length) {
    finishSimulation();
    return;
  }

  const symbol = tape[headIndex];
  const tr = currentDFA.transitions.find(t => t.from === currentState && t.symbol === symbol);

  if (!tr) {
    logMessage(`TRAVAMENTO: Função de transição indefinida para δ(${getStateLabel(currentState)}, '${symbol}')`, "fail");
    setVerdict("rejected", "CADEIA NÃO RECONHECIDA", `O autômato parou prematuramente sem transição.`);
    pauseAutoPlay();
    return;
  }

  const prevState = currentState;
  const nextState = tr.to;

  highlightTransition(prevState, nextState, symbol);
  updateTableHighlights(prevState, symbol);

  logMessage(`Passo ${headIndex + 1}: &delta;(${getStateLabel(prevState)}, '${symbol}') &rarr; ${getStateLabel(nextState)}`, "step");

  currentState = nextState;
  headIndex++;

  highlightActiveState(currentState);
  renderTape();

  if (headIndex >= tape.length) {
    finishSimulation();
  } else {
    setVerdict("running", "Processando cadeia...", `Estado atual: ${getStateLabel(currentState)} | Próximo símbolo: '${tape[headIndex]}'`);
  }
}

function finishSimulation() {
  pauseAutoPlay();
  const isAccepted = currentDFA.finalStates.includes(currentState);
  const stateLabel = getStateLabel(currentState);

  if (isAccepted) {
    setVerdict("accepted", "RESULTADO: ACEITA", `O estado de parada ${stateLabel} pertence ao conjunto de estados de aceitação F.`);
    logMessage(`RESULTADO: Cadeia "${currentString}" ACEITA no estado ${stateLabel}.`, "ok");
  } else {
    setVerdict("rejected", "RESULTADO: REJEITA", `O estado de parada ${stateLabel} NÃO pertence ao conjunto F.`);
    logMessage(`RESULTADO: Cadeia "${currentString}" REJEITADA no estado ${stateLabel}.`, "fail");
  }

  updateTableHighlights(currentState, null);
}

function resetSimulation() {
  pauseAutoPlay();
  setupInputString(currentString);
  logMessage(`Simulador reiniciado para a configuração inicial.`, "normal");
}

function toggleAutoPlay() {
  if (isAutoPlaying) {
    pauseAutoPlay();
  } else {
    startAutoPlay();
  }
}

function startAutoPlay() {
  if (headIndex >= tape.length) {
    setupInputString(currentString);
  }

  isAutoPlaying = true;
  dom.btnPlay.textContent = "[ Pausar ]";

  function runCycle() {
    if (!isAutoPlaying) return;
    if (headIndex >= tape.length) {
      pauseAutoPlay();
      return;
    }
    step();
    if (headIndex < tape.length && isAutoPlaying) {
      stepTimer = setTimeout(runCycle, animationSpeed);
    } else {
      pauseAutoPlay();
    }
  }

  stepTimer = setTimeout(runCycle, 150);
}

function pauseAutoPlay() {
  isAutoPlaying = false;
  if (stepTimer) {
    clearTimeout(stepTimer);
    stepTimer = null;
  }
  dom.btnPlay.textContent = "[ Executar ]";
}

// ============================================================================
// 8. ATUALIZAÇÕES VISUAIS DA INTERFACE
// ============================================================================
function highlightActiveState(stateId) {
  document.querySelectorAll(".state-node").forEach(node => {
    node.classList.remove("active");
  });

  const activeNode = document.getElementById(`node-${stateId}`);
  if (activeNode) {
    activeNode.classList.add("active");
  }
}

function highlightTransition(fromId, toId, symbol) {
  clearActiveTransitions();

  const selector = `[id^="trans-${fromId}-${toId}-"]`;
  const group = document.querySelector(selector);

  if (group) {
    const path = group.querySelector(".transition-path");
    const label = group.querySelector(".transition-label-text");

    if (path) {
      path.classList.add("active");
      path.setAttribute("marker-end", "url(#arrowActive)");
    }
    if (label) {
      label.classList.add("active");
    }

    setTimeout(() => {
      if (path) {
        path.classList.remove("active");
        path.setAttribute("marker-end", "url(#arrow)");
      }
      if (label) {
        label.classList.remove("active");
      }
    }, Math.min(animationSpeed - 50, 600));
  }
}

function clearActiveTransitions() {
  document.querySelectorAll(".transition-path.active").forEach(p => {
    p.classList.remove("active");
    p.setAttribute("marker-end", "url(#arrow)");
  });
  document.querySelectorAll(".transition-label-text.active").forEach(l => {
    l.classList.remove("active");
  });
}

function updateTableHighlights(stateId, symbol) {
  document.querySelectorAll(".delta-table tr").forEach(tr => tr.classList.remove("active-row"));
  document.querySelectorAll(".delta-table td").forEach(td => td.classList.remove("active-cell"));

  const row = document.getElementById(`row-${stateId}`);
  if (row) {
    row.classList.add("active-row");
  }

  if (symbol !== null) {
    const cell = document.getElementById(`cell-${stateId}-${symbol}`);
    if (cell) {
      cell.classList.add("active-cell");
    }
  }
}

function setVerdict(type, title, detail) {
  dom.verdictBox.className = `panel result-panel ${type}`;
  dom.verdictText.textContent = title;
  dom.verdictDetail.textContent = detail;
}

function logMessage(msg, typeClass = "normal") {
  const line = document.createElement("div");
  line.className = `log-line ${typeClass}`;
  line.innerHTML = msg;
  dom.executionLog.prepend(line);
}

function clearLog() {
  dom.executionLog.innerHTML = `<div class="log-line">Registro limpo pelo operador.</div>`;
}

function getStateLabel(stateId) {
  const st = currentDFA.states.find(s => s.id === stateId);
  return st ? st.label : stateId;
}

// Execução ao carregar o DOM
document.addEventListener("DOMContentLoaded", init);
