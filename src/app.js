(function initDialogueCoach() {
  "use strict";

  const analyzer = window.DialogueAnalyzer;
  const state = {
    context: "partner",
    exampleIndexes: {
      partner: 0,
      family: 0,
      friend: 0,
      work: 0
    },
    analysis: null,
    selectedTone: "soft"
  };

  const nodes = {
    segments: Array.from(document.querySelectorAll(".segment")),
    situation: document.getElementById("situationInput"),
    draft: document.getElementById("draftInput"),
    fear: document.getElementById("fearInput"),
    want: document.getElementById("wantInput"),
    analyze: document.getElementById("analyzeButton"),
    clear: document.getElementById("clearButton"),
    example: document.getElementById("exampleButton"),
    coachStatus: document.getElementById("coachStatus"),
    coachTitle: document.getElementById("coachTitle"),
    coachNextStep: document.getElementById("coachNextStep"),
    coachModule: document.getElementById("coachModule"),
    coachFocus: document.getElementById("coachFocus"),
    reflection: document.getElementById("reflectionList"),
    ladder: document.getElementById("ladderList"),
    regulationSummary: document.getElementById("regulationSummary"),
    regulationPlan: document.getElementById("regulationPlan"),
    cbtDiary: document.getElementById("cbtDiary"),
    patterns: document.getElementById("patternList"),
    pedagogySummary: document.getElementById("pedagogySummary"),
    pedagogyBridge: document.getElementById("pedagogyBridge"),
    safety: document.getElementById("safetyBanner"),
    toneTabs: document.getElementById("toneTabs"),
    messageReadiness: document.getElementById("messageReadiness"),
    finalMessage: document.getElementById("finalMessage"),
    copy: document.getElementById("copyButton")
  };

  const placeholdersByContext = {
    partner: {
      situation:
        "Например: мы расстались, он то пишет тепло, то снова отдаляется. Мне больно и хочется срочно доказать, что я важна.",
      draft:
        "Можно вставить резкий черновик партнеру. Тренажер поможет отделить боль от импульса и выбрать, писать ли вообще.",
      fear: "меня не выберут, меня легко оставить...",
      want: "ясность, достоинство, не писать из паники..."
    },
    family: {
      situation:
        "Например: мама при родственниках сказала, что я опять все усложняю. Я почувствовала злость, стыд и желание закрыться.",
      draft:
        "Можно вставить фразу родителю или близкому. Тренажер поможет сохранить уважение и границу без старой роли.",
      fear: "меня не воспринимают всерьез...",
      want: "уважение, спокойный тон, право на границу..."
    },
    friend: {
      situation:
        "Например: подруга отменила встречу в последний момент и потом написала как ни в чем не бывало. Мне стало обидно.",
      draft:
        "Можно вставить черновик другу. Тренажер поможет сказать о боли без проверки любви и без обесценивания дружбы.",
      fear: "я навязываюсь, дружба уже не важна...",
      want: "честность, тепло, ясность ожиданий..."
    },
    work: {
      situation:
        "Например: коллега отменил встречу за десять минут и не предложил новое время. Из-за этого завис мой срок.",
      draft:
        "Можно вставить рабочий черновик. Тренажер поможет убрать обвинение и собрать факт, влияние, просьбу и следующий шаг.",
      fear: "на мне останется чужая ответственность...",
      want: "рабочая ясность, сроки, уважение к вкладу..."
    }
  };

  const examplesByContext = {
    partner: [
      {
        situation:
          "Мы расстались. Он сказал, что один эффективнее и не готов продолжать отношения, хотя раньше говорил о будущем. Я чувствую боль, тревогу и туман, как будто часть меня хочет срочно написать ему и доказать, что я важна.",
        draft:
          "Как ты мог так легко уйти? Значит, все слова были ложью. Я для тебя вообще ничего не значила.",
        fear: "меня не выбрали, меня можно заменить, меня накрывает туман",
        want: "ясность, достоинство, не писать из паники, сохранить себя"
      },
      {
        situation:
          "Партнер прочитал сообщение днем, не ответил до вечера, а потом написал: «ты опять драматизируешь». Мне стало тревожно и обидно.",
        draft:
          "Ты всегда пропадаешь, тебе вообще все равно на меня. Нормальный человек так не делает.",
        fear: "меня легко оставить",
        want: "контакт и бережность"
      }
    ],
    family: [
      {
        situation:
          "Мама сказала при всех, что я опять все усложняю. Я почувствовала злость и стыд, а потом захотела не приезжать на семейные встречи.",
        draft: "С тобой невозможно говорить, ты никогда меня не слышишь.",
        fear: "меня снова поставят в роль ребенка, который всем мешает",
        want: "уважение и возможность говорить спокойно"
      },
      {
        situation:
          "Отец без предупреждения пришел ко мне домой и сказал, что семья имеет право знать, что со мной происходит. Я напряглась и разозлилась.",
        draft: "Ты вообще не понимаешь границ. Перестань лезть в мою жизнь.",
        fear: "мои границы снова не будут считаться настоящими",
        want: "теплый контакт, но с уважением к моему пространству"
      }
    ],
    friend: [
      {
        situation:
          "Подруга второй раз отменила встречу в последний момент и потом написала как ни в чем не бывало. Я почувствовала обиду и сомнение, важна ли ей наша дружба.",
        draft: "Если тебе все равно, так и скажи. Я устала подстраиваться.",
        fear: "я навязываюсь, а дружба важна только мне",
        want: "честность, тепло и понятные договоренности"
      },
      {
        situation:
          "Друг пошутил про мою личную тему в компании. Все засмеялись, а я замолчала и потом весь вечер чувствовала стыд.",
        draft: "Спасибо, что выставил меня смешной перед всеми.",
        fear: "если я скажу, меня назовут слишком чувствительной",
        want: "бережность, уважение и возможность сказать, что это задело"
      }
    ],
    work: [
      {
        situation:
          "Коллега отменил встречу за десять минут до начала и не предложил новое время. Из-за этого завис мой срок, а ответственность может лечь на меня.",
        draft: "Это из-за тебя мы опять все сорвали. Делай что хочешь.",
        fear: "на мне останется чужая ответственность",
        want: "рабочую ясность, срок и следующий шаг"
      },
      {
        situation:
          "Руководитель в общем чате написал, что задача сделана небрежно, хотя до этого не давал критерии. Я почувствовала злость и желание защищаться.",
        draft: "Если бы вы нормально объясняли, что хотите, не было бы проблем.",
        fear: "мою работу обесценят публично",
        want: "конкретные критерии, уважительный тон и возможность исправить без стыда"
      }
    ]
  };

  function bindEvents() {
    nodes.segments.forEach((segment) => {
      segment.addEventListener("click", () => setContext(segment.dataset.context));
    });

    nodes.analyze.addEventListener("click", runAnalysis);
    nodes.clear.addEventListener("click", clearForm);
    nodes.example.addEventListener("click", insertExample);
    nodes.copy.addEventListener("click", copyMessage);

    [nodes.situation, nodes.draft, nodes.fear, nodes.want].forEach((input) => {
      input.addEventListener("input", debounce(runAnalysis, 260));
    });
  }

  function setContext(context) {
    state.context = context;
    nodes.segments.forEach((segment) => {
      segment.classList.toggle("active", segment.dataset.context === context);
    });
    updateContextPlaceholders(context);
    runAnalysis();
  }

  function runAnalysis() {
    const hasContent = [nodes.situation, nodes.draft, nodes.fear, nodes.want].some(
      (node) => node.value.trim().length > 0
    );

    if (!hasContent) {
      renderEmpty();
      return;
    }

    state.analysis = analyzer.analyzeDialogue({
      situation: nodes.situation.value,
      draft: nodes.draft.value,
      fear: nodes.fear.value,
      want: nodes.want.value,
      context: state.context
    });
    state.selectedTone = state.analysis.defaultTone;
    renderAnalysis();
  }

  function renderEmpty() {
    nodes.coachStatus.hidden = true;
    nodes.safety.hidden = true;
    nodes.reflection.innerHTML =
      '<p class="empty-note">Запишите ситуацию или черновик сообщения. Разбор появится здесь.</p>';
    nodes.ladder.innerHTML =
      '<li class="empty-note">Факт, смысл, чувство, потребность и просьба соберутся в одну цепочку.</li>';
    nodes.regulationSummary.innerHTML =
      '<p class="empty-note">Если есть перегрузка, freeze или диссоциация, сначала появится план стабилизации.</p>';
    nodes.regulationPlan.innerHTML = "";
    nodes.cbtDiary.innerHTML =
      '<p class="empty-note">КПТ-дневник покажет автоматическую мысль, первую реакцию и более сбалансированную альтернативу.</p>';
    nodes.patterns.innerHTML =
      '<p class="empty-note">Если в черновике есть критика, презрение, защита или уход, они подсветятся отдельно.</p>';
    nodes.pedagogySummary.innerHTML =
      '<p class="empty-note">Если собеседник закрывается, защищается или не понимает формат разговора, здесь появится мягкий мост и примеры.</p>';
    nodes.pedagogyBridge.innerHTML = "";
    nodes.toneTabs.innerHTML = "";
    nodes.messageReadiness.hidden = true;
    nodes.messageReadiness.innerHTML = "";
    nodes.finalMessage.value = "";
    setCopyAvailability(true, "Скопировать");
  }

  function renderAnalysis() {
    const analysis = state.analysis;
    renderCoachState(analysis.coachState);
    nodes.safety.hidden = !analysis.safety;
    renderReflection(analysis.reflection);
    renderLadder(analysis.ladder);
    renderRegulationPlan(analysis.regulationPlan);
    renderCbtDiary(analysis.cbtDiary);
    renderPatterns(analysis.patterns);
    renderPedagogicalBridge(analysis.pedagogicalBridge || fallbackPedagogicalBridge());
    renderToneTabs(analysis);
    renderMessageReadiness(analysis.coachState.sendReadiness);
    renderMessage();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function renderReflection(items) {
    nodes.reflection.innerHTML = items
      .map(
        ([term, detail]) => `
          <div class="reflection-item">
            <dt>${escapeHtml(term)}</dt>
            <dd>${escapeHtml(detail)}</dd>
          </div>
        `
      )
      .join("");
  }

  function renderCoachState(coachState) {
    nodes.coachStatus.hidden = false;
    nodes.coachStatus.dataset.mode = coachState.mode;
    nodes.coachTitle.textContent = coachState.title;
    nodes.coachNextStep.textContent = coachState.nextStep;
    nodes.coachModule.textContent = coachModuleLabel(coachState.module);
    nodes.coachFocus.textContent = coachState.focus;
  }

  function renderLadder(items) {
    nodes.ladder.innerHTML = items
      .map(
        ([title, detail], index) => `
          <li class="ladder-step">
            <span class="step-index">${index + 1}</span>
            <div class="step-body">
              <strong>${escapeHtml(title)}</strong>
              <span>${escapeHtml(detail)}</span>
            </div>
          </li>
        `
      )
      .join("");
  }

  function renderPatterns(patterns) {
    nodes.patterns.innerHTML = patterns
      .map(
        (pattern) => `
          <article class="pattern-card ${pattern.hit ? "hit" : ""}">
            <header>
              <h3>${escapeHtml(pattern.title)}</h3>
              <span class="pattern-pill">${pattern.hit ? "замечено" : escapeHtml(pattern.marker)}</span>
            </header>
            <p>${escapeHtml(pattern.hit ? pattern.antidote : neutralPatternText(pattern.id))}</p>
          </article>
        `
      )
      .join("");
  }

  function renderPedagogicalBridge(bridge) {
    nodes.pedagogySummary.innerHTML = `
      <p><strong>${escapeHtml(bridge.title)}.</strong> ${escapeHtml(bridge.principle)}</p>
    `;

    const cards = bridge.cards
      .map(
        ([title, detail]) => `
          <article class="pedagogy-card">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(detail)}</p>
          </article>
        `
      )
      .join("");
    const examples = bridge.examples
      .map(
        (example) => `
          <article class="pedagogy-card example-card">
            <h3>${escapeHtml(example.title)}</h3>
            <p>${escapeHtml(example.text)}</p>
          </article>
        `
      )
      .join("");

    nodes.pedagogyBridge.dataset.mode = bridge.mode;
    nodes.pedagogyBridge.innerHTML = cards + examples;
  }

  function fallbackPedagogicalBridge() {
    return {
      mode: "warmup",
      title: "Разогрев к разговору",
      principle:
        "Если собеседник закрывается, защищается или не понимает формат разговора, можно начать с маленького правила контакта.",
      cards: [["Начать проще", "Назвать один следующий шаг, а не разбирать всю историю сразу."]],
      examples: [
        {
          title: "Правило паузы",
          text: "Если сейчас трудно говорить, можно взять паузу и назвать срок, когда вернемся к разговору."
        }
      ]
    };
  }

  function renderRegulationPlan(plan) {
    const signalText = plan.signals.length ? plan.signals.join("; ") : "нет отдельных сигналов";
    nodes.regulationSummary.innerHTML = `
      <p><strong>${escapeHtml(plan.title)}.</strong> ${escapeHtml(plan.principle)}</p>
      <p class="signal-line">${escapeHtml(signalText)}</p>
    `;

    const steps = plan.steps
      .map(
        ([title, detail]) => `
          <article class="regulation-card">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(detail)}</p>
          </article>
        `
      )
      .join("");
    const avoid = `
      <article class="regulation-card avoid-card">
        <h3>Не делать</h3>
        <ul>
          ${plan.avoid.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
    `;

    nodes.regulationPlan.dataset.mode = plan.mode;
    nodes.regulationPlan.innerHTML = steps + avoid;
  }

  function renderCbtDiary(items) {
    nodes.cbtDiary.innerHTML = items
      .map(
        ([title, detail]) => `
          <article class="diary-cell">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(detail)}</p>
          </article>
        `
      )
      .join("");
  }

  function renderToneTabs(analysis) {
    nodes.toneTabs.innerHTML = Object.entries(analysis.toneLabels)
      .map(
        ([tone, label]) => `
          <button class="tone-tab ${tone === state.selectedTone ? "active" : ""}" type="button" data-tone="${tone}">
            ${escapeHtml(label)}
          </button>
        `
      )
      .join("");

    Array.from(nodes.toneTabs.querySelectorAll(".tone-tab")).forEach((tab) => {
      tab.addEventListener("click", () => {
        state.selectedTone = tab.dataset.tone;
        renderToneTabs(state.analysis);
        renderMessage();
      });
    });
  }

  function renderMessage() {
    nodes.finalMessage.value = state.analysis.formulations[state.selectedTone] || "";
  }

  function renderMessageReadiness(readiness) {
    nodes.messageReadiness.hidden = false;
    nodes.messageReadiness.dataset.status = readiness.status;
    nodes.messageReadiness.innerHTML = `
      <strong>${escapeHtml(readiness.label)}</strong>
      <span>${escapeHtml(readiness.detail)}</span>
    `;
    setCopyAvailability(readiness.canCopy, readiness.canCopy ? "Скопировать" : "Пока не копировать");
  }

  function neutralPatternText(id) {
    const copy = {
      criticism: "Сейчас нет явного «ты всегда / ты никогда». Это помогает говорить о событии, а не о характере человека.",
      contempt: "Нет явного унижения или ярлыка. Так у разговора остается шанс на уважение.",
      defensiveness: "Нет заметной контратаки. Можно удержать фокус на факте и своей части.",
      stonewalling: "Нет резкого закрытия контакта. Если нужна пауза, лучше назвать время возвращения."
    };
    return copy[id] || "Паттерн не обнаружен.";
  }

  function insertExample() {
    const examples = examplesByContext[state.context] || examplesByContext.partner;
    const currentIndex = state.exampleIndexes[state.context] || 0;
    const example = examples[currentIndex % examples.length];
    state.exampleIndexes[state.context] = currentIndex + 1;

    nodes.situation.value = example.situation;
    nodes.draft.value = example.draft;
    nodes.fear.value = example.fear;
    nodes.want.value = example.want;
    runAnalysis();
  }

  function clearForm() {
    nodes.situation.value = "";
    nodes.draft.value = "";
    nodes.fear.value = "";
    nodes.want.value = "";
    setContext("partner");
    renderEmpty();
  }

  async function copyMessage() {
    const readiness = state.analysis && state.analysis.coachState.sendReadiness;
    if (readiness && !readiness.canCopy) {
      flashCopyState("Сначала пауза");
      return;
    }

    const value = nodes.finalMessage.value.trim();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      flashCopyState("Скопировано");
    } catch (error) {
      nodes.finalMessage.select();
      document.execCommand("copy");
      flashCopyState("Скопировано");
    }
  }

  function setCopyAvailability(enabled, label) {
    nodes.copy.disabled = !enabled;
    nodes.copy.setAttribute("aria-disabled", String(!enabled));
    nodes.copy.querySelector("span").textContent = label;
  }

  function coachModuleLabel(module) {
    const labels = {
      prep_coach: "Подготовка",
      stabilization_coach: "Стабилизация",
      message_coach: "Формулировка",
      rehearsal_coach: "Репетиция",
      reflection_coach: "Рефлексия"
    };
    return labels[module] || "Коуч";
  }

  function updateContextPlaceholders(context) {
    const placeholders = placeholdersByContext[context] || placeholdersByContext.partner;
    nodes.situation.placeholder = placeholders.situation;
    nodes.draft.placeholder = placeholders.draft;
    nodes.fear.placeholder = placeholders.fear;
    nodes.want.placeholder = placeholders.want;
    nodes.example.title = `Вставить пример: ${contextLabel(context)}`;
  }

  function contextLabel(context) {
    const labels = {
      partner: "партнер",
      family: "семья",
      friend: "друг",
      work: "работа"
    };
    return labels[context] || "пример";
  }

  function flashCopyState(label) {
    const original = nodes.copy.querySelector("span").textContent;
    nodes.copy.querySelector("span").textContent = label;
    window.setTimeout(() => {
      nodes.copy.querySelector("span").textContent = original;
    }, 1200);
  }

  function debounce(fn, wait) {
    let timer = 0;
    return function debounced() {
      window.clearTimeout(timer);
      timer = window.setTimeout(fn, wait);
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  bindEvents();
  updateContextPlaceholders(state.context);
  renderEmpty();

  if (window.lucide) {
    window.lucide.createIcons();
  }
})();
