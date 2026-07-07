const assert = require("node:assert/strict");
const test = require("node:test");
const corpus = require("../data/training-corpus.ru.json");
const { analyzeDialogue } = require("../src/dialogueAnalyzer");

const CATEGORY_IDS = new Set(corpus.categories.map((category) => category.id));
const STRUCTURE_IDS = new Set(Object.keys(corpus.response_structures));
const CASE_TYPES = new Set(["training_situation", "message_prompt", "advanced_case"]);

function caseById(caseId) {
  const item = corpus.cases.find((candidate) => candidate.case_id === caseId);
  assert.ok(item, `Missing corpus case: ${caseId}`);
  return item;
}

function analyzeCase(caseId) {
  const item = caseById(caseId);
  return analyzeDialogue({
    context: "partner",
    situation: [item.situation, item.user_prompt].filter(Boolean).join(" "),
    draft: item.user_raw_reaction || "",
    fear: item.theme.join(", "),
    want: item.model_should_detect.join(", ")
  });
}

function reflectionValue(analysis, title) {
  const item = analysis.reflection.find(([name]) => name === title);
  assert.ok(item, `Missing reflection item: ${title}`);
  return item[1];
}

function patternHit(analysis, patternId) {
  const pattern = analysis.patterns.find((item) => item.id === patternId);
  assert.ok(pattern, `Missing pattern: ${patternId}`);
  return pattern.hit;
}

test("corpus has the expected top-level training assets", () => {
  assert.equal(corpus.version, "0.1.0");
  assert.equal(corpus.language, "ru");
  assert.equal(corpus.privacy.anonymized, true);
  assert.ok(corpus.cases.length >= 40);
  assert.ok(corpus.categories.length >= 10);
  assert.ok(corpus.global_model_should_not_do.length >= 6);
  assert.ok(corpus.negative_answer_patterns.length >= 5);
  assert.ok(corpus.end_to_end_examples.length >= 1);
});

test("case identifiers are unique and anonymized", () => {
  const ids = corpus.cases.map((item) => item.case_id);

  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.match(id, /^anon_[a-z0-9_]+$/);
  }

  const serialized = JSON.stringify(corpus).toLocaleLowerCase("ru-RU");
  assert.doesNotMatch(serialized, /(^|[^а-яё])рома([^а-яё]|$)/iu);
});

test("each corpus case follows the dataset contract", () => {
  for (const item of corpus.cases) {
    assert.ok(CASE_TYPES.has(item.case_type), `${item.case_id}: invalid case_type`);
    assert.ok(CATEGORY_IDS.has(item.category), `${item.case_id}: unknown category`);
    assert.ok(
      STRUCTURE_IDS.has(item.ideal_response_structure),
      `${item.case_id}: unknown response structure`
    );
    assert.ok(Array.isArray(item.theme) && item.theme.length > 0, `${item.case_id}: theme`);
    assert.ok(item.situation && item.situation.length > 20, `${item.case_id}: situation`);
    assert.ok(item.user_prompt && item.user_prompt.length > 20, `${item.case_id}: user_prompt`);
    assert.ok(
      Array.isArray(item.model_should_detect) && item.model_should_detect.length > 0,
      `${item.case_id}: model_should_detect`
    );
    assert.ok(
      Array.isArray(item.expected_response_features) && item.expected_response_features.length > 0,
      `${item.case_id}: expected_response_features`
    );
  }
});

test("global and negative-answer safeguards cover core failure modes", () => {
  const globalRules = corpus.global_model_should_not_do.join("\n");
  const badAnswers = corpus.negative_answer_patterns.map((item) => item.bad_answer).join("\n");
  const problems = corpus.negative_answer_patterns.map((item) => item.problem).join("\n");

  assert.match(globalRules, /диагностировать партнера/);
  assert.match(globalRules, /манипуляции/);
  assert.match(globalRules, /романтизировать прощение/);
  assert.match(globalRules, /диссоциации|потере ориентации/);
  assert.match(globalRules, /частями системы/);
  assert.match(badAnswers, /обязательно вернется/);
  assert.match(badAnswers, /Напиши ему холодно/);
  assert.match(problems, /Диагноз/);
  assert.match(problems, /Манипуляция/);
});

test("end-to-end examples define required and forbidden answer features", () => {
  for (const item of corpus.end_to_end_examples) {
    assert.ok(item.example_id.startsWith("anon_e2e_"));
    assert.ok(item.user_prompt.length > 40);
    assert.ok(item.must_include.length >= 6);
    assert.ok(item.must_not_include.length >= 3);
    assert.match(item.must_include.join("\n"), /факт/);
    assert.match(item.must_not_include.join("\n"), /вернется|пространство|простить/);
  }
});

test("corpus includes the main training categories from the source brief", () => {
  const expected = [
    "avoidant_withdrawal",
    "anxious_protest",
    "mixed_signals",
    "unfinished_previous_family",
    "future_talk_vs_action",
    "sexual_closeness_vs_emotional_distance",
    "breakup_grief",
    "repair_attempts",
    "boundaries_with_warmth",
    "radical_forgiveness",
    "reality_check",
    "trauma_dissociation_regulation"
  ];

  for (const categoryId of expected) {
    assert.ok(CATEGORY_IDS.has(categoryId), `Missing category: ${categoryId}`);
    assert.ok(
      corpus.cases.some((item) => item.category === categoryId),
      `No cases for category: ${categoryId}`
    );
  }
});

test("selected avoidant-dialogue cases trigger non-diagnostic repair guidance", () => {
  const analysis = analyzeCase("anon_avoidant_dialogue_011");

  assert.equal(analysis.safety, false);
  assert.match(reflectionValue(analysis, "Импульс"), /обвинение|контратаку/);
  assert.equal(patternHit(analysis, "criticism"), true);
  assert.match(
    analysis.cbtDiary.map(([, value]) => value).join("\n"),
    /гипотез|не доказанный мотив|несколько объяснений/
  );
});

test("selected anxious-protest case produces a pause-oriented CBT diary", () => {
  const analysis = analyzeCase("anon_message_no_reply_035");
  const diary = analysis.cbtDiary.map(([, value]) => value).join("\n");

  assert.equal(analysis.safety, false);
  assert.match(reflectionValue(analysis, "Потребность"), /предсказуемость|ясность/);
  assert.match(diary, /Автоматическая|первая реакция|Сделать паузу/i);
});

test("selected breakup case recognizes completion and avoids unsafe certainty", () => {
  const analysis = analyzeCase("anon_left_key_009");
  const combined = [
    reflectionValue(analysis, "Интерпретация"),
    reflectionValue(analysis, "Потребность"),
    analysis.cbtDiary.map(([, value]) => value).join("\n")
  ].join("\n");

  assert.equal(analysis.safety, false);
  assert.match(combined, /гипотеза|не доказанный мотив|расставания/);
  assert.doesNotMatch(combined, /обязательно верн/);
});

test("selected reality-check case is represented as discernment, not diagnosis", () => {
  const item = caseById("anon_avoidant_or_not_choosing_042");

  assert.equal(item.category, "reality_check");
  assert.match(item.model_should_detect.join("\n"), /риск диагноза/);
  assert.match(item.model_should_teach.join("\n"), /встречное движение|ответственность/);
  assert.match(item.expected_response_features.join("\n"), /защита .*не выбирает|возможно защита/i);
});

test("selected dissociation corpus case requires stabilization before dialogue", () => {
  const item = caseById("anon_dissociation_fog_044");
  const analysis = analyzeCase(item.case_id);
  const plan = [
    analysis.regulationPlan.title,
    analysis.regulationPlan.principle,
    analysis.regulationPlan.steps.map(([, value]) => value).join("\n"),
    analysis.regulationPlan.avoid.join("\n")
  ].join("\n");

  assert.equal(item.category, "trauma_dissociation_regulation");
  assert.equal(item.ideal_response_structure, "trauma_stabilization");
  assert.equal(analysis.regulationPlan.mode, "dissociation");
  assert.match(item.model_should_teach.join("\n"), /сначала заземление/);
  assert.match(plan, /Ориентировка|Сенсорный|не принимать больших решений/);
});

test("selected parts/system corpus case keeps internal language gentle", () => {
  const item = caseById("anon_parts_system_overwhelm_045");
  const analysis = analyzeCase(item.case_id);
  const plan = analysis.regulationPlan.steps.map(([, value]) => value).join("\n");

  assert.equal(analysis.regulationPlan.mode, "dissociation");
  assert.match(item.model_should_teach.join("\n"), /не спорить с частями/);
  assert.match(plan, /Никому внутри не нужно решать отношения сейчас/);
});

test("selected self-harm corpus case goes to safety mode", () => {
  const item = caseById("anon_safety_self_harm_047");
  const analysis = analyzeCase(item.case_id);

  assert.equal(analysis.safety, true);
  assert.equal(analysis.regulationPlan.mode, "safety");
  assert.match(item.model_should_detect.join("\n"), /самоповреждения/);
  assert.match(analysis.regulationPlan.steps.map(([, value]) => value).join("\n"), /экстренной помощью|острые предметы/);
});
