const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function makeElement(id, options = {}) {
  const element = {
    id,
    value: "",
    placeholder: "",
    hidden: false,
    disabled: false,
    innerHTML: "",
    textContent: options.text || "",
    dataset: { ...(options.dataset || {}) },
    listeners: {},
    classList: {
      active: options.active || false,
      toggle(className, enabled) {
        if (className === "active") {
          this.active = Boolean(enabled);
        }
      }
    },
    addEventListener(event, handler) {
      this.listeners[event] = handler;
    },
    setAttribute(name, value) {
      this[name] = value;
    },
    querySelector(selector) {
      if (selector === "span") {
        return this.span || (this.span = makeElement(`${id}-span`));
      }
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };

  return element;
}

function makeAnalysis() {
  return {
    safety: false,
    coachState: {
      mode: "steady",
      title: "Можно планировать диалог",
      module: "prep_coach",
      nextStep: "Собрать одну короткую фразу.",
      focus: "Проверить импульс.",
      sendReadiness: {
        status: "ready",
        label: "Можно использовать как черновик",
        detail: "Перечитайте перед отправкой.",
        canCopy: true
      }
    },
    regulationPlan: {
      mode: "steady",
      title: "Регуляция",
      principle: "Пауза.",
      signals: [],
      steps: [],
      avoid: []
    },
    reflection: [["Факт", "Факт"]],
    ladder: [["Реакция", "Реакция"]],
    cbtDiary: [["Ситуация", "Ситуация"]],
    patterns: [],
    pedagogicalBridge: {
      mode: "warmup",
      title: "Разогрев к разговору",
      principle: "Начать с простого формата.",
      cards: [["Начать проще", "Один шаг."]],
      examples: [{ title: "Пример", text: "Можно начать мягко." }]
    },
    formulations: { soft: "Мягкая фраза" },
    defaultTone: "soft",
    toneLabels: { soft: "Мягко" }
  };
}

function loadAppHarness() {
  const elements = {
    situationInput: makeElement("situationInput"),
    draftInput: makeElement("draftInput"),
    fearInput: makeElement("fearInput"),
    wantInput: makeElement("wantInput"),
    analyzeButton: makeElement("analyzeButton"),
    clearButton: makeElement("clearButton"),
    exampleButton: makeElement("exampleButton"),
    coachStatus: makeElement("coachStatus"),
    coachTitle: makeElement("coachTitle"),
    coachNextStep: makeElement("coachNextStep"),
    coachModule: makeElement("coachModule"),
    coachFocus: makeElement("coachFocus"),
    reflectionList: makeElement("reflectionList"),
    ladderList: makeElement("ladderList"),
    regulationSummary: makeElement("regulationSummary"),
    regulationPlan: makeElement("regulationPlan"),
    cbtDiary: makeElement("cbtDiary"),
    patternList: makeElement("patternList"),
    pedagogySummary: makeElement("pedagogySummary"),
    pedagogyBridge: makeElement("pedagogyBridge"),
    safetyBanner: makeElement("safetyBanner"),
    toneTabs: makeElement("toneTabs"),
    messageReadiness: makeElement("messageReadiness"),
    finalMessage: makeElement("finalMessage"),
    copyButton: makeElement("copyButton")
  };
  elements.copyButton.span = makeElement("copyButtonSpan", { text: "Скопировать" });

  const segments = ["partner", "family", "friend", "work"].map((context) =>
    makeElement(`segment-${context}`, {
      text: context,
      dataset: { context },
      active: context === "partner"
    })
  );
  const calls = [];
  const document = {
    querySelectorAll(selector) {
      if (selector === ".segment") return segments;
      return [];
    },
    getElementById(id) {
      return elements[id] || null;
    }
  };
  const window = {
    DialogueAnalyzer: {
      analyzeDialogue(input) {
        calls.push(input);
        return makeAnalysis();
      }
    },
    clearTimeout() {},
    setTimeout(handler) {
      handler();
      return 0;
    }
  };
  const sourcePath = path.join(__dirname, "../src/app.js");
  const source = fs.readFileSync(sourcePath, "utf8");

  vm.runInNewContext(source, { window, document, navigator: {}, console }, { filename: sourcePath });

  return { calls, elements, segments };
}

test("context switch updates field placeholders", () => {
  const { elements, segments } = loadAppHarness();

  assert.match(elements.situationInput.placeholder, /расстались/);
  segments.find((segment) => segment.dataset.context === "family").listeners.click();
  assert.match(elements.situationInput.placeholder, /мама|родственниках/i);
  assert.match(elements.draftInput.placeholder, /родителю|близкому/);

  segments.find((segment) => segment.dataset.context === "work").listeners.click();
  assert.match(elements.situationInput.placeholder, /коллега|срок/i);
  assert.match(elements.wantInput.placeholder, /рабочая ясность/);
});

test("example button inserts a template for the active context", () => {
  const { calls, elements, segments } = loadAppHarness();

  segments.find((segment) => segment.dataset.context === "friend").listeners.click();
  elements.exampleButton.listeners.click();

  assert.match(elements.situationInput.value, /Подруга|Друг/);
  assert.match(elements.draftInput.value, /Если тебе все равно|Спасибо/);
  assert.equal(calls.at(-1).context, "friend");

  elements.exampleButton.listeners.click();
  assert.match(elements.situationInput.value, /Друг пошутил/);

  segments.find((segment) => segment.dataset.context === "work").listeners.click();
  elements.exampleButton.listeners.click();
  assert.match(elements.situationInput.value, /Коллега|Руководитель/);
  assert.equal(calls.at(-1).context, "work");
});

test("renders the pedagogical bridge panel from analyzer output", () => {
  const { elements, segments } = loadAppHarness();

  segments.find((segment) => segment.dataset.context === "friend").listeners.click();
  elements.exampleButton.listeners.click();

  assert.match(elements.pedagogySummary.innerHTML, /Разогрев к разговору/);
  assert.match(elements.pedagogyBridge.innerHTML, /Начать проще/);
  assert.match(elements.pedagogyBridge.innerHTML, /Можно начать мягко/);
  assert.equal(elements.pedagogyBridge.dataset.mode, "warmup");
});
