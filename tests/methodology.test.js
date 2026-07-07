const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const methodology = require("../data/difficult-conversations-methodology.ru.json");

const REQUIRED_MODULE_IDS = [
  "nature_of_difficult_conversations",
  "purpose_before_conversation",
  "emotions_before_conversation",
  "regulation_before_conversation",
  "planning_the_message",
  "active_listening",
  "reaction_planning",
  "practice_rehearsal",
  "reflection_after_conversation",
  "affirmations_commitments"
];

function readDoc(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

test("methodology defines a complete 10-module training arc", () => {
  assert.equal(methodology.version, "0.1.0");
  assert.equal(methodology.language, "ru");
  assert.equal(methodology.source.type, "user_provided_workbook");
  assert.match(methodology.source.archive, /all_vertical\.zip$/);
  assert.match(methodology.source.principle, /без дословной транскрибации/);

  assert.equal(methodology.modules.length, 10);
  assert.deepEqual(
    methodology.modules.map((module) => module.id),
    REQUIRED_MODULE_IDS
  );
  assert.deepEqual(
    methodology.modules.map((module) => module.order),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  );
});

test("each methodology module has a coachable exercise contract", () => {
  const ids = new Set();

  for (const module of methodology.modules) {
    assert.ok(!ids.has(module.id), `Duplicate module id: ${module.id}`);
    ids.add(module.id);
    assert.ok(module.title.length > 5, `${module.id}: title`);
    assert.ok(module.teaches.length > 40, `${module.id}: teaches`);
    assert.ok(module.source_pages.length >= 4, `${module.id}: source_pages`);
    assert.ok(module.learning_outcomes.length >= 3, `${module.id}: learning_outcomes`);
    assert.ok(module.coach_moves.length >= 3, `${module.id}: coach_moves`);
    assert.ok(module.practice.name, `${module.id}: practice name`);
    assert.ok(module.practice.prompt.length > 30, `${module.id}: practice prompt`);
    assert.ok(module.practice.output.length > 10, `${module.id}: practice output`);
    assert.ok(module.handoff_to_app.length >= 1, `${module.id}: handoff_to_app`);
  }
});

test("methodology preserves CBT and trauma-informed routing", () => {
  const serialized = JSON.stringify(methodology);
  const regulation = methodology.modules.find(
    (module) => module.id === "regulation_before_conversation"
  );
  const emotions = methodology.modules.find(
    (module) => module.id === "emotions_before_conversation"
  );
  const systemsTouchpoints = methodology.modules.filter((module) =>
    /systems|parts|dissociative|trauma/i.test(JSON.stringify(module))
  );

  assert.match(serialized, /КПТ-дневник|автоматическая мысль|альтернативная реакция/);
  assert.match(serialized, /safety|overwhelm|dissociation/);
  assert.match(JSON.stringify(regulation), /Ориентация|parts\/system|отложить контакт/i);
  assert.match(JSON.stringify(emotions), /ситуация, мысль, реакция, альтернатива/i);
  assert.ok(systemsTouchpoints.length >= 4);
  assert.match(methodology.safety.trauma_dissociation_principles.join("\n"), /титрация/);
});

test("coach modes and session templates cover before, during, and after work", () => {
  const modeIds = new Set(methodology.coach_modes.map((mode) => mode.id));
  const templateIds = new Set(methodology.session_templates.map((template) => template.id));
  const phases = new Set(methodology.phases.map((phase) => phase.id));

  for (const expected of [
    "prep_coach",
    "stabilization_coach",
    "message_coach",
    "rehearsal_coach",
    "reflection_coach"
  ]) {
    assert.ok(modeIds.has(expected), `Missing coach mode: ${expected}`);
  }

  assert.deepEqual(Array.from(phases), ["before", "during", "after"]);
  assert.ok(templateIds.has("quick_10_minute_prep"));
  assert.ok(templateIds.has("full_45_minute_training"));
  assert.ok(templateIds.has("aftercare_15_minute_debrief"));
  assert.match(methodology.assessment.not_ready_to_send.join("\n"), /паники|тумана|самоповреждения/);
});

test("methodology and coach docs point to the structured artifact and core safeguards", () => {
  const methodologyDoc = readDoc("docs/difficult-conversations-methodology.ru.md");
  const coachDoc = readDoc("docs/difficult-conversations-coach.ru.md");
  const combined = [methodologyDoc, coachDoc].join("\n");

  assert.match(methodologyDoc, /data\/difficult-conversations-methodology\.ru\.json/);
  assert.match(methodologyDoc, /КПТ-дневник/);
  assert.match(methodologyDoc, /10 минут перед сообщением|Минимальный Цикл/);
  assert.match(coachDoc, /Сначала состояние, потом смысл, потом слова/);
  assert.match(coachDoc, /Stabilization-first/);
  assert.match(combined, /не диагностирует|Не диагностировать/);
  assert.match(combined, /насилие|самоповреждение|живая поддержка/);
  assert.match(combined, /dissociative systems|parts\/system|частями/);
});
