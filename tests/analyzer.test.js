const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const {
  analyzeDialogue,
  detectPatterns,
  detectEmotions,
  detectRegulationState
} = require("../src/dialogueAnalyzer");

function reflectionValue(analysis, title) {
  const item = analysis.reflection.find(([name]) => name === title);
  assert.ok(item, `Missing reflection item: ${title}`);
  return item[1];
}

function patternById(patterns, id) {
  const pattern = patterns.find((item) => item.id === id);
  assert.ok(pattern, `Missing pattern: ${id}`);
  return pattern;
}

function diaryValue(analysis, title) {
  const item = analysis.cbtDiary.find(([name]) => name === title);
  assert.ok(item, `Missing CBT diary item: ${title}`);
  return item[1];
}

function assertToneSet(analysis) {
  assert.deepEqual(Object.keys(analysis.formulations), [
    "soft",
    "honest",
    "vulnerable",
    "boundary",
    "short"
  ]);
  assert.deepEqual(Object.keys(analysis.toneLabels), [
    "soft",
    "honest",
    "vulnerable",
    "boundary",
    "short"
  ]);
}

test("exports the public analyzer API", () => {
  assert.equal(typeof analyzeDialogue, "function");
  assert.equal(typeof detectPatterns, "function");
  assert.equal(typeof detectEmotions, "function");
  assert.equal(typeof detectRegulationState, "function");
});

test("attaches the analyzer to the browser global when CommonJS is unavailable", () => {
  const sourcePath = path.join(__dirname, "../src/dialogueAnalyzer.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  const context = {};

  vm.runInNewContext(source, context, { filename: sourcePath });

  assert.equal(typeof context.DialogueAnalyzer.analyzeDialogue, "function");
  assert.match(
    reflectionValue(
      context.DialogueAnalyzer.analyzeDialogue({ situation: "Она не ответила до вечера." }),
      "Потребность"
    ),
    /предсказуемость/
  );
});

test("falls back to the script global when globalThis and module.exports are unavailable", () => {
  const sourcePath = path.join(__dirname, "../src/dialogueAnalyzer.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  const context = {
    globalThis: undefined,
    module: {}
  };

  vm.runInNewContext(source, context, { filename: sourcePath });

  assert.equal(context.module.exports, undefined);
  assert.equal(typeof context.DialogueAnalyzer.detectPatterns, "function");
});

test("returns gentle guidance for empty input", () => {
  const analysis = analyzeDialogue();

  assert.equal(analysis.safety, false);
  assert.equal(analysis.defaultTone, "soft");
  assert.match(reflectionValue(analysis, "Факт"), /Сначала запишите/);
  assert.match(reflectionValue(analysis, "Интерпретация"), /Возможная история поверх факта/);
  assert.equal(reflectionValue(analysis, "Эмоция"), "боль, тревога");
  assert.match(reflectionValue(analysis, "Импульс"), /первой волны/);
  assert.equal(
    reflectionValue(analysis, "Потребность"),
    "ясность, уважение и подтверждение значимости связи"
  );
  assert.equal(analysis.regulationPlan.mode, "steady");
  assert.equal(analysis.coachState.mode, "steady");
  assert.equal(analysis.coachState.sendReadiness.status, "ready");
  assert.equal(analysis.coachState.sendReadiness.canCopy, true);
  assert.match(analysis.regulationPlan.principle, /короткой паузы/);
  assert.equal(analysis.patterns.every((pattern) => pattern.hit === false), true);
  assert.match(diaryValue(analysis, "Автоматическая мысль"), /связь под угрозой/);
  assert.match(diaryValue(analysis, "Альтернативная реакция"), /Сделать паузу/);
  assertToneSet(analysis);
});

test("analyzes a partner conflict without taking the user's first story as fact", () => {
  const analysis = analyzeDialogue({
    context: "partner",
    situation:
      "Он прочитал сообщение и не ответил до вечера. Мне стало тревожно и обидно.",
    draft:
      "Ты всегда пропадаешь, тебе вообще все равно. Нормальный человек так не делает.",
    fear: "меня легко оставить",
    want: "контакт и бережность"
  });

  assert.equal(analysis.safety, false);
  assert.equal(analysis.defaultTone, "soft");
  assert.match(reflectionValue(analysis, "Факт"), /прочитал сообщение/);
  assert.match(reflectionValue(analysis, "Интерпретация"), /ему\/ей все равно/);
  assert.match(reflectionValue(analysis, "Интерпретация"), /гипотеза, не доказанный мотив/);
  assert.equal(
    reflectionValue(analysis, "Потребность"),
    "предсказуемость, подтверждение контакта и ясность"
  );
  assert.equal(patternById(analysis.patterns, "criticism").hit, true);
  assert.equal(patternById(analysis.patterns, "contempt").hit, true);
  assert.match(analysis.ladder.at(-1)[1], /контакт и бережность/);
  assert.match(analysis.formulations.soft, /контакт и бережность/);
  assert.match(analysis.formulations.vulnerable, /предсказуемость/);
  assert.match(diaryValue(analysis, "Ситуация"), /Он прочитал сообщение/);
  assert.match(diaryValue(analysis, "Автоматическая мысль"), /ему\/ей все равно/);
  assert.match(diaryValue(analysis, "Автоматическая реакция"), /Отправить обвинение/);
  assert.match(diaryValue(analysis, "Что не доказывает"), /мотив другого человека/);
  assert.match(diaryValue(analysis, "Альтернативная мысль"), /попросить ясности/);
  assert.match(diaryValue(analysis, "Альтернативная реакция"), /не обвиняя/);
  assertToneSet(analysis);
});

test("switches to safety mode when there are threats, control, or fear", () => {
  const analysis = analyzeDialogue({
    situation: "Он угрожает и контролирует, кому я пишу.",
    draft: "Я боюсь идти домой."
  });

  assert.equal(analysis.safety, true);
  assert.equal(analysis.coachState.mode, "safety");
  assert.equal(analysis.coachState.sendReadiness.canCopy, false);
  assert.match(analysis.coachState.nextStep, /безопасный шаг/);
  assert.equal(analysis.defaultTone, "boundary");
  assert.equal(analysis.ladder[0][0], "Стоп");
  assert.match(analysis.ladder[0][1], /угрозы, контроля или принуждения/);
  assert.match(analysis.formulations.boundary, /прекращаю этот разговор/);
  assert.match(analysis.formulations.short, /небезопасно/);
  assert.equal(analysis.regulationPlan.mode, "safety");
  assert.match(analysis.regulationPlan.principle, /живая опора/);
  assert.match(analysis.regulationPlan.steps.map(([, value]) => value).join("\n"), /экстренной помощью/);
  assert.match(diaryValue(analysis, "Проверка"), /не должен убеждать себя терпеть/);
  assert.match(diaryValue(analysis, "Альтернативная мысль"), /не обычная ссора/);
  assert.match(diaryValue(analysis, "Альтернативная реакция"), /безопасный следующий шаг/);
  assertToneSet(analysis);
});

test("detects trauma-related overwhelm and offers intensity reduction before messaging", () => {
  const state = detectRegulationState("Меня трясет, накрывает паника, хочу написать еще раз.", false);
  const analysis = analyzeDialogue({
    situation: "Он не ответил после спокойного сообщения.",
    draft: "Если я не напишу еще раз, меня разнесет.",
    fear: "он исчезнет, меня накрывает паника"
  });

  assert.equal(state.mode, "overwhelm");
  assert.equal(analysis.coachState.mode, "overwhelm");
  assert.equal(analysis.coachState.sendReadiness.status, "pause_first");
  assert.equal(analysis.coachState.sendReadiness.canCopy, false);
  assert.equal(analysis.regulationPlan.mode, "overwhelm");
  assert.match(analysis.regulationPlan.title, /снизить интенсивность/);
  assert.match(analysis.regulationPlan.steps.map(([title]) => title).join("\n"), /Пауза|Контейнер/);
  assert.match(analysis.regulationPlan.avoid.join("\n"), /второе сообщение из паники/);
});

test("detects dissociation and keeps the plan stabilization-first", () => {
  const analysis = analyzeDialogue({
    situation:
      "После разговора все как в тумане, я не чувствую тело, будто проваливаюсь и часть меня хочет срочно писать.",
    draft: "Напишу сейчас, пока меня совсем не отключило.",
    fear: "части внутри спорят, система замерла"
  });
  const planText = [
    analysis.regulationPlan.principle,
    analysis.regulationPlan.steps.map(([, value]) => value).join("\n"),
    analysis.regulationPlan.avoid.join("\n")
  ].join("\n");

  assert.equal(analysis.safety, false);
  assert.equal(analysis.coachState.mode, "dissociation");
  assert.equal(analysis.coachState.sendReadiness.status, "pause_first");
  assert.equal(analysis.coachState.sendReadiness.canCopy, false);
  assert.match(analysis.coachState.nextStep, /60 секунд ориентировки/);
  assert.equal(analysis.regulationPlan.mode, "dissociation");
  assert.match(analysis.regulationPlan.title, /заземление/);
  assert.match(planText, /дату|место|возраст/);
  assert.match(planText, /Никому внутри не нужно решать отношения сейчас/);
  assert.match(planText, /не заставлять себя вспоминать подробности/);
  assert.match(planText, /не принимать больших решений/);
});

test("adds a pedagogical bridge when the other person avoids or closes", () => {
  const analysis = analyzeDialogue({
    context: "partner",
    situation:
      "Он закрывается, избегает разговора и говорит, что сейчас не готов отвечать. Мне важно не давить, но связь становится небезопасной, когда он исчезает без срока.",
    draft: "Ты опять просто исчезаешь и оставляешь меня ждать.",
    want: "контакт без давления и понятный срок возвращения"
  });
  const bridgeText = [
    analysis.pedagogicalBridge.title,
    analysis.pedagogicalBridge.principle,
    analysis.pedagogicalBridge.cards.map(([, detail]) => detail).join("\n"),
    analysis.pedagogicalBridge.examples.map((example) => example.text).join("\n")
  ].join("\n");

  assert.equal(analysis.pedagogicalBridge.mode, "avoidance");
  assert.match(bridgeText, /закрыться|пауза/);
  assert.match(bridgeText, /связь.*опасность|пауза не ставила нашу связь/);
  assert.match(bridgeText, /вернусь с ответом через 3 дня|назови срок/);
});

test("adds a child-style scaffolding bridge for parent and teacher cases", () => {
  const analysis = analyzeDialogue({
    context: "family",
    situation:
      "Ребенок резко ответил учительнице после конфликта с братом и сестрой утром. Я хочу помочь ему понять, что реакция была не только на учительницу.",
    draft: "Нельзя так разговаривать со взрослыми.",
    want: "помочь ребенку доформулировать, что с ним произошло"
  });
  const examples = analysis.pedagogicalBridge.examples.map((example) => example.text).join("\n");

  assert.equal(analysis.pedagogicalBridge.mode, "child_scaffold");
  assert.match(analysis.pedagogicalBridge.principle, /языка/);
  assert.match(examples, /Учительница/);
  assert.match(examples, /братом\/сестрой|брат|сестр/);
  assert.match(examples, /Как можно было бы сказать это точнее/);
});

test("adds a pedagogical bridge when the other person defends or devalues", () => {
  const analysis = analyzeDialogue({
    context: "partner",
    situation:
      "Он говорит, что я драматизирую, спорит и защищается: 'ты тоже виновата'. Мне важно не давить, а показать другой способ отвечать.",
    draft: "Ты никогда не признаешь боль и все обесцениваешь.",
    want: "разговор без суда и без обесценивания"
  });
  const bridgeText = [
    analysis.pedagogicalBridge.title,
    analysis.pedagogicalBridge.principle,
    analysis.pedagogicalBridge.cards.map(([, detail]) => detail).join("\n"),
    analysis.pedagogicalBridge.examples.map((example) => example.text).join("\n")
  ].join("\n");

  assert.equal(analysis.pedagogicalBridge.mode, "defense");
  assert.match(bridgeText, /слышит обвинение|перейти от суда к навыку/);
  assert.match(bridgeText, /не прошу тебя признать себя виноватым/);
  assert.match(bridgeText, /не обесценивать сам факт/);
});

test("uses a warmup bridge for unclear but non-safety conversations", () => {
  const analysis = analyzeDialogue({
    context: "friend",
    situation: "Мы хотим обсудить сложную тему без обвинений и понять, как говорить дальше.",
    draft: "Мне важно начать спокойно и не разбирать всю историю сразу.",
    want: "маленький формат разговора"
  });
  const examples = analysis.pedagogicalBridge.examples.map((example) => example.text).join("\n");

  assert.equal(analysis.pedagogicalBridge.mode, "warmup");
  assert.match(analysis.pedagogicalBridge.principle, /через пример, формат и следующий маленький навык/);
  assert.match(examples, /где разговор стал слишком трудным/);
  assert.match(examples, /Если кто-то из нас не готов отвечать сразу/);
});

test("treats self-harm language as safety mode, not dialogue coaching", () => {
  const analysis = analyzeDialogue({
    situation: "После разговора мне хочется порезать себя, чтобы стало тише.",
    draft: "Напишу ему перед этим."
  });

  assert.equal(analysis.safety, true);
  assert.equal(analysis.coachState.mode, "safety");
  assert.equal(analysis.coachState.sendReadiness.status, "safety_first");
  assert.equal(analysis.regulationPlan.mode, "safety");
  assert.match(analysis.regulationPlan.steps.map(([, value]) => value).join("\n"), /острые предметы|экстренной помощью/);
  assert.match(analysis.regulationPlan.avoid.join("\n"), /не писать партнеру из состояния угрозы/);
});

test("detects all destructive draft patterns and keeps neutral drafts clean", () => {
  const cases = [
    ["criticism", "Ты всегда опять все портишь."],
    ["contempt", "Нормальный человек так не делает."],
    ["defensiveness", "Это из-за тебя, а ты сама виновата."],
    ["stonewalling", "Делай что хочешь, я молчу."]
  ];

  for (const [id, text] of cases) {
    const patterns = detectPatterns(text);
    assert.equal(patternById(patterns, id).hit, true, `Expected ${id} for: ${text}`);
  }

  const neutralPatterns = detectPatterns("Мне больно, и я хочу поговорить спокойно.");
  assert.equal(neutralPatterns.every((pattern) => pattern.hit === false), true);
});

test("uses destructive patterns to describe a risky impulse", () => {
  const analysis = analyzeDialogue({
    situation: "Мы договорились созвониться вечером.",
    draft: "Ты никогда не держишь слово."
  });

  assert.match(reflectionValue(analysis, "Импульс"), /обвинение, контратаку/);
});

test("keeps a calm draft as a direct statement and trims long drafts", () => {
  const calm = analyzeDialogue({
    situation: "Мы договорились обсудить это вечером.",
    draft: "Мне хочется поговорить спокойно."
  });
  assert.match(reflectionValue(calm, "Импульс"), /^Сказать прямо: Мне хочется/);

  const longDraft = "Мне важно сказать это спокойно. ".repeat(10);
  const trimmed = analyzeDialogue({
    situation: "Мы договорились обсудить это вечером.",
    draft: longDraft
  });
  const impulse = reflectionValue(trimmed, "Импульс");
  assert.ok(impulse.length < longDraft.length);
  assert.ok(impulse.endsWith("..."));
});

test("detects emotions, removes duplicates, caps output, and falls back when none are found", () => {
  assert.deepEqual(detectEmotions("Мне страшно, грустно и обидно."), [
    "обида",
    "страх",
    "грусть"
  ]);
  assert.deepEqual(detectEmotions("Мне больно, боль, тревожно, злость, обида, страшно."), [
    "тревога",
    "злость",
    "обида",
    "боль"
  ]);
  assert.deepEqual(detectEmotions("Факт без названных чувств."), ["боль", "тревога"]);
});

test("maps situation signals to the right needs", () => {
  const cases = [
    [
      "Она не ответила и потом молчала.",
      "partner",
      "предсказуемость, подтверждение контакта и ясность"
    ],
    [
      "Коллега отменил встречу и опоздал на новую.",
      "work",
      "надежность, учет договоренностей и уважение к времени"
    ],
    [
      "Он кричал, говорил грубым тоном и использовал сарказм.",
      "partner",
      "уважение, спокойный тон и эмоциональная безопасность"
    ],
    [
      "Она соврала и скрыла важную часть истории.",
      "partner",
      "честность, восстановление доверия и понятные границы"
    ],
    [
      "На работе снова спор о бюджете и ответственности.",
      "work",
      "ясные договоренности, распределение ответственности и уважение к вкладу"
    ],
    [
      "Родитель ребенка спорит с учителем про школу.",
      "family",
      "сотрудничество, уважение ролей и фокус на благополучии ребенка"
    ]
  ];

  for (const [situation, context, expectedNeed] of cases) {
    const analysis = analyzeDialogue({ situation, context });
    assert.equal(reflectionValue(analysis, "Потребность"), expectedNeed);
  }
});

test("uses context-specific fallback needs and contact goals", () => {
  const work = analyzeDialogue({
    context: "work",
    situation: "Нужно обсудить следующий шаг без обвинений."
  });
  assert.equal(
    reflectionValue(work, "Потребность"),
    "уважение, ясность ролей и конкретная договоренность"
  );
  assert.match(work.formulations.soft, /рабочий контакт и ясность/);

  const family = analyzeDialogue({
    context: "family",
    situation: "Мы не договорились, как говорить об этом дальше."
  });
  assert.equal(
    reflectionValue(family, "Потребность"),
    "бережность, уважение границ и ощущение, что связь не рвется"
  );
  assert.match(family.formulations.soft, /связь и уважение границ/);

  const friend = analyzeDialogue({
    context: "friend",
    situation: "Мы не договорились, как говорить об этом дальше."
  });
  assert.equal(
    reflectionValue(friend, "Потребность"),
    "ясность, уважение и подтверждение значимости связи"
  );
  assert.match(friend.formulations.soft, /дружбу и честность/);
});

test("deduplicates interpretations and labels them as hypotheses", () => {
  const analysis = analyzeDialogue({
    situation: "Я подумала: я не важна, ему все равно, меня не слышат и опять не слышат.",
    draft: "Кажется, меня не уважают."
  });
  const interpretation = reflectionValue(analysis, "Интерпретация");

  assert.match(interpretation, /я не важен\/не важна/);
  assert.match(interpretation, /ему\/ей все равно/);
  assert.match(interpretation, /меня не слышат/);
  assert.match(interpretation, /меня не уважают/);
  assert.match(interpretation, /гипотеза/);
  assert.equal(interpretation.indexOf("меня не слышат"), interpretation.lastIndexOf("меня не слышат"));
});

test("builds a balanced CBT alternative when the automatic thought is betrayal", () => {
  const analysis = analyzeDialogue({
    situation: "Она скрыла важную часть истории, и я подумал, что меня предали.",
    fear: "меня используют"
  });

  assert.match(diaryValue(analysis, "Автоматическая мысль"), /меня предали/);
  assert.match(diaryValue(analysis, "Что подтверждает"), /понятной/);
  assert.match(diaryValue(analysis, "Альтернативная мысль"), /не превращая гипотезу о мотивах в факт/);
});

test("builds the vulnerability ladder with defaults when fear and goal are absent", () => {
  const analysis = analyzeDialogue({
    situation: "Мы договорились поговорить вечером, но разговор не состоялся."
  });

  assert.equal(analysis.ladder.length, 5);
  assert.deepEqual(
    analysis.ladder.map(([title]) => title),
    ["Реакция", "Смысл", "Чувство", "Рана", "Просьба"]
  );
  assert.match(analysis.ladder[3][1], /меня не услышат, не выберут или оставят/);
  assert.match(analysis.ladder[4][1], /контакт, уважение и возможность договориться/);
});

test("returns every formulation tone for non-safety conversations", () => {
  const analysis = analyzeDialogue({
    context: "partner",
    situation: "Она отменила встречу за десять минут до начала.",
    want: "теплый контакт и ясность"
  });

  assertToneSet(analysis);
  assert.match(analysis.formulations.soft, /^Я хочу сказать это спокойно/);
  assert.match(analysis.formulations.honest, /^Мне больно из-за этой ситуации/);
  assert.match(analysis.formulations.vulnerable, /^Во мне поднялась сильная реакция/);
  assert.match(analysis.formulations.boundary, /^Я понимаю, что у тебя могут быть свои причины/);
  assert.match(analysis.formulations.short, /^Я почувствовал\(а\)/);
});

test("handles a breakup case without romanticizing pursuit or breaking Russian phrasing", () => {
  const analysis = analyzeDialogue({
    context: "partner",
    situation:
      "Рома сказал, что не готов продолжать отношения, и мы расстались. После этого он то выходит на связь тепло, то снова отдаляется. Мне больно, тревожно и хочется понять, была ли я ему важна.",
    draft: "Ты просто использовал меня и опять исчез. Если тебе все равно, так и скажи.",
    fear: "меня не выбрали и легко оставили",
    want: "ясность, уважение к моей боли и возможность не разрушать себя"
  });

  assert.equal(analysis.safety, false);
  assert.equal(analysis.coachState.mode, "closure");
  assert.equal(analysis.coachState.module, "reflection_coach");
  assert.equal(analysis.coachState.sendReadiness.status, "draft_only");
  assert.match(analysis.coachState.focus, /не сообщением/);
  assert.equal(
    reflectionValue(analysis, "Потребность"),
    "ясность, уважение к боли и понятные границы после расставания"
  );
  assert.match(reflectionValue(analysis, "Интерпретация"), /меня используют/);
  assert.doesNotMatch(reflectionValue(analysis, "Факт"), /Мне больно/);
  assert.match(analysis.ladder[3][1], /меня не выбрали и легко оставили/);
  assert.match(analysis.formulations.soft, /Когда Рома сказал/);
  assert.match(analysis.formulations.soft, /я почувствовал\(а\) тревогу и боль/);
  assert.match(analysis.formulations.soft, /не буду отправлять/);
  assert.doesNotMatch(analysis.formulations.soft, /Можем поговорить/);
  assert.doesNotMatch(analysis.formulations.soft, /была ли я\.\./);
  assert.doesNotMatch(analysis.formulations.soft, /мне стало тревога/);
  assert.match(analysis.formulations.boundary, /понятные границы после расставания/);
  assert.match(diaryValue(analysis, "Автоматическая мысль"), /меня используют/);
  assert.match(diaryValue(analysis, "Альтернативная мысль"), /беречь свои границы/);
  assert.match(diaryValue(analysis, "Альтернативная реакция"), /понятные границы после расставания/);
  assert.equal(patternById(analysis.patterns, "criticism").hit, true);
});

test("trims long reflected facts and keeps message facts compact", () => {
  const longSituation = "Она перечислила много деталей без паузы. ".repeat(12);
  const analysis = analyzeDialogue({ situation: longSituation });
  const fact = reflectionValue(analysis, "Факт");

  assert.ok(fact.length < longSituation.length);
  assert.ok(fact.endsWith("..."));
  assert.doesNotMatch(analysis.formulations.honest, /\.\.\./);
  assert.match(analysis.formulations.honest, /Она перечислила много деталей без паузы\./);
});
