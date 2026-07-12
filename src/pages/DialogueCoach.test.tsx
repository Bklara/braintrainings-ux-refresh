import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { analyzeDialogue } from "@/lib/dialogueAnalyzer";
import { DialogueCoach, dialogueCoachExamples, localizeAnalysis } from "./DialogueCoach";

describe("DialogueCoach", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts on the context step", () => {
    render(<DialogueCoach />);

    expect(
      screen.getByRole("heading", { name: "Тренажер сложного разговора" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "С кем разговор" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Партн/ })).toBeInTheDocument();
  });

  it("walks the flow and shows the analysis at the end", () => {
    render(<DialogueCoach />);

    fireEvent.click(screen.getByRole("button", { name: /Партн/ }));
    expect(screen.getByRole("heading", { name: "Что произошло" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Заполнить примером/ }));
    fireEvent.click(screen.getByRole("button", { name: /Далее/ }));

    expect(screen.getByRole("heading", { name: "Страх и цель" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Далее/ }));

    expect(
      screen.getByRole("heading", { name: /Черновик/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Показать разбор/ }));

    expect(screen.getByRole("heading", { name: "Разбор" })).toBeInTheDocument();
    expect(screen.getByText("Главный следующий шаг")).toBeInTheDocument();
    expect(screen.getByText("Рабочая фраза")).toBeInTheDocument();
    expect(screen.getAllByText(/Не обязательно отправлять/).length).toBeGreaterThan(0);
  });

  it("resets back to the context step", () => {
    render(<DialogueCoach />);

    fireEvent.click(screen.getByRole("button", { name: /Партн/ }));
    fireEvent.click(screen.getByRole("button", { name: /Заполнить примером/ }));
    fireEvent.click(screen.getByRole("button", { name: /Заново/ }));

    expect(screen.getByRole("heading", { name: "С кем разговор" })).toBeInTheDocument();
  });

  it("cycles through multiple examples inside the selected context", () => {
    render(<DialogueCoach />);

    fireEvent.click(screen.getByRole("button", { name: /Партн/ }));
    fireEvent.click(screen.getByRole("button", { name: /Заполнить примером/ }));

    expect((screen.getByPlaceholderText(/Опиши, что реально произошло/) as HTMLTextAreaElement).value).toContain(
      "Партнёр сказал",
    );

    fireEvent.click(screen.getByRole("button", { name: /Заполнить примером/ }));

    expect((screen.getByPlaceholderText(/Опиши, что реально произошло/) as HTMLTextAreaElement).value).toContain(
      "прочитал сообщение утром",
    );
  });

  it("walks the English flow and shows localized analysis", () => {
    render(<DialogueCoach />);

    fireEvent.click(screen.getByRole("button", { name: "en" }));
    expect(screen.getByRole("heading", { name: "Difficult Conversation Coach" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Partner/ }));
    expect(screen.getByRole("heading", { name: "What happened" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Fill with an example/ }));
    expect((screen.getByPlaceholderText(/Describe what actually happened/) as HTMLTextAreaElement).value).toContain(
      "My partner said",
    );

    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    fireEvent.click(screen.getByRole("button", { name: /Show analysis/ }));

    expect(screen.getByRole("heading", { name: "Analysis" })).toBeInTheDocument();
    expect(screen.getByText("Main next step")).toBeInTheDocument();
    expect(screen.getByText("Working phrase")).toBeInTheDocument();
    expect(screen.getAllByText(/You do not have to send it/).length).toBeGreaterThan(0);
  });

  it("keeps every example analyzable and tied to its own situation", () => {
    const cyrillic = /[А-Яа-яЁё]/;

    Object.entries(dialogueCoachExamples).forEach(([language, contexts]) => {
      Object.entries(contexts).forEach(([context, examples]) => {
        expect(examples.length).toBeGreaterThanOrEqual(10);

        examples.forEach((example) => {
          const rawAnalysis = analyzeDialogue({ ...example, context });
          const analysis = localizeAnalysis(
            rawAnalysis,
            language as "ru" | "en",
            example,
            context as "partner" | "family" | "friend" | "work",
          );
          const anchor = example.situation.split(/\s+/).slice(0, 3).join(" ");
          const groundedText = `${analysis.reflection[0][1]} ${analysis.cbtDiary[0][1]}`;
          const finalMessage = analysis.formulations[analysis.defaultTone];

          expect(groundedText).toContain(anchor);
          expect(finalMessage.trim().length).toBeGreaterThan(20);

          if (language === "en") {
            expect(analysis.reflection[0][0]).toBe("Fact");
            expect(analysis.cbtDiary.some(([title]) => title === "Alternative reaction")).toBe(true);
            expect(finalMessage).not.toMatch(cyrillic);
          } else {
            expect(analysis.reflection[0][0]).toBe("Факт");
            expect(analysis.cbtDiary.some(([title]) => title === "Альтернативная реакция")).toBe(true);
          }
        });
      });
    });
  });

  it("keeps English analysis modes aligned with the example intent", () => {
    const [breakupExample, , , avoidanceExample] = dialogueCoachExamples.en.partner;

    const breakupAnalysis = localizeAnalysis(
      analyzeDialogue({ ...breakupExample, context: "partner" }),
      "en",
      breakupExample,
      "partner",
    );
    const avoidanceAnalysis = localizeAnalysis(
      analyzeDialogue({ ...avoidanceExample, context: "partner" }),
      "en",
      avoidanceExample,
      "partner",
    );

    expect(breakupAnalysis.coachState.mode).toBe("closure");
    expect(breakupAnalysis.coachState.title).toBe("Breakup: keep yourself intact");
    expect(avoidanceAnalysis.pedagogicalBridge.mode).toBe("avoidance");
    expect(avoidanceAnalysis.pedagogicalBridge.title).toBe("When the other person shuts down");
  });
});
