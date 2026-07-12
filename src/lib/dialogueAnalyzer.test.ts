import { describe, expect, it } from "vitest";
import { analyzeDialogue, detectPatterns, detectRegulationState } from "./dialogueAnalyzer";

const reflectionValue = (analysis: ReturnType<typeof analyzeDialogue>, title: string) => {
  const item = analysis.reflection.find(([name]) => name === title);
  expect(item).toBeTruthy();
  return item?.[1] || "";
};

const diaryValue = (analysis: ReturnType<typeof analyzeDialogue>, title: string) => {
  const item = analysis.cbtDiary.find(([name]) => name === title);
  expect(item).toBeTruthy();
  return item?.[1] || "";
};

describe("dialogueAnalyzer", () => {
  it("keeps the breakup case in reflection mode instead of pursuit", () => {
    const analysis = analyzeDialogue({
      context: "partner",
      situation:
        "Партнер сказал, что не готов продолжать отношения, и мы расстались. После этого он то выходит на связь тепло, то снова отдаляется. Мне больно, тревожно и хочется понять, была ли я ему важна.",
      draft: "Ты просто использовал меня и опять исчез. Если тебе все равно, так и скажи.",
      fear: "меня не выбрали и легко оставили",
      want: "ясность, уважение к моей боли и возможность не разрушать себя",
    });

    expect(analysis.safety).toBe(false);
    expect(analysis.coachState.mode).toBe("closure");
    expect(analysis.coachState.sendReadiness.status).toBe("draft_only");
    expect(reflectionValue(analysis, "Потребность")).toMatch(/границы после расставания/);
    expect(analysis.formulations.soft).toMatch(/не буду отправлять/);
    expect(diaryValue(analysis, "Альтернативная мысль")).toMatch(/беречь свои границы/);
  });

  it("routes dissociation and system language to stabilization first", () => {
    const state = detectRegulationState(
      "Все как в тумане, я не чувствую тело, части внутри спорят и система замерла.",
      false,
    );
    const analysis = analyzeDialogue({
      situation:
        "После разговора все как в тумане, я не чувствую тело, будто проваливаюсь и часть меня хочет срочно писать.",
      draft: "Напишу сейчас, пока меня совсем не отключило.",
      fear: "части внутри спорят, система замерла",
    });

    expect(state.mode).toBe("dissociation");
    expect(analysis.coachState.mode).toBe("dissociation");
    expect(analysis.coachState.sendReadiness.canCopy).toBe(false);
    expect(analysis.regulationPlan.title).toMatch(/заземление|ориентировка/);
  });

  it("adds a pedagogical bridge for avoidance with a concrete return time", () => {
    const analysis = analyzeDialogue({
      context: "partner",
      situation:
        "Он закрывается, избегает разговора и говорит, что сейчас не готов отвечать. Мне важно не давить, но связь становится небезопасной, когда он исчезает без срока.",
      draft: "Ты опять просто исчезаешь и оставляешь меня ждать.",
      want: "контакт без давления и понятный срок возвращения",
    });
    const examples = analysis.pedagogicalBridge.examples.map((example) => example.text).join("\n");

    expect(analysis.pedagogicalBridge.mode).toBe("avoidance");
    expect(examples).toMatch(/вернусь с ответом через 3 дня|назови срок/);
  });

  it("uses child-style scaffolding for teacher and sibling cases", () => {
    const analysis = analyzeDialogue({
      context: "family",
      situation:
        "Ребенок резко ответил учительнице после конфликта с братом и сестрой утром. Я хочу помочь ему понять, что реакция была не только на учительницу.",
      draft: "Нельзя так разговаривать со взрослыми.",
      want: "помочь ребенку доформулировать, что с ним произошло",
    });
    const examples = analysis.pedagogicalBridge.examples.map((example) => example.text).join("\n");

    expect(analysis.pedagogicalBridge.mode).toBe("child_scaffold");
    expect(examples).toMatch(/Учительница/);
    expect(examples).toMatch(/Как можно было бы сказать это точнее/);
  });

  it("routes English breakup examples to closure mode", () => {
    const analysis = analyzeDialogue({
      context: "partner",
      situation:
        "My partner said he was not ready to continue the relationship, and we broke up. Since then he sometimes reaches out warmly and then pulls away again.",
      draft: "You just used me and disappeared again. If you do not care, just say it.",
      fear: "I was not chosen and can be left easily",
      want: "clarity, respect for my pain, and a way not to destroy myself",
    });

    expect(analysis.coachState.mode).toBe("closure");
    expect(reflectionValue(analysis, "Потребность")).toMatch(/границы после расставания/);
  });

  it("routes English shutdown and return-time cases to the avoidance bridge", () => {
    const analysis = analyzeDialogue({
      context: "partner",
      situation:
        "After an argument, my partner shut down and said he did not want to talk right now. He did not say when he would come back to the topic.",
      draft: "You are running away again. It is impossible to have a normal conversation with you.",
      fear: "the pause will turn into disappearance",
      want: "a pause with a specific time to return",
    });

    expect(analysis.pedagogicalBridge.mode).toBe("avoidance");
  });

  it("detects English draft criticism and contempt patterns", () => {
    const patterns = detectPatterns("You always do this. Thanks for humiliating me in front of everyone.");

    expect(patterns.find((pattern) => pattern.id === "criticism")?.hit).toBe(true);
    expect(patterns.find((pattern) => pattern.id === "contempt")?.hit).toBe(true);
  });

  it("routes English dissociation and system language to stabilization first", () => {
    const state = detectRegulationState(
      "Everything is foggy, I feel unreal, part of me wants to write now, and the system froze.",
      false,
    );

    expect(state.mode).toBe("dissociation");
  });
});
