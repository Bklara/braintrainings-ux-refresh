import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DialogueCoach } from "./DialogueCoach";

describe("DialogueCoach", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the coach as the first usable screen", () => {
    render(<DialogueCoach />);

    expect(screen.getByRole("heading", { name: "Тренажер сложного разговора" })).toBeInTheDocument();
    expect(screen.getByLabelText("Что произошло")).toBeInTheDocument();
    expect(screen.getByText("Разбор появится здесь")).toBeInTheDocument();
    expect(screen.getByText("Добавить страх")).toBeInTheDocument();
    expect(screen.getByText("Сохранено: 0")).toBeInTheDocument();
    expect(screen.getByText("Личная библиотека")).toBeInTheDocument();
    expect(screen.getByText("Коммуникационные приемы")).toBeInTheDocument();
    expect(screen.getByText("Trauma-informed темп")).toBeInTheDocument();
  });

  it("loads the partner example and shows the breakup-safe coach state", () => {
    render(<DialogueCoach />);

    fireEvent.click(screen.getByRole("button", { name: "Пример" }));

    expect((screen.getByLabelText("Что произошло") as HTMLTextAreaElement).value).toContain("Партнер сказал");
    expect(screen.getByText(/Расставание: сохранить себя/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Фраза" })).toBeInTheDocument();
    expect(screen.getByText("Не обязательно отправлять")).toBeInTheDocument();
  });

  it("switches to the family example and renders the pedagogical bridge", () => {
    render(<DialogueCoach />);

    fireEvent.click(screen.getByRole("button", { name: "Семья" }));
    fireEvent.click(screen.getByRole("button", { name: "Пример" }));

    expect((screen.getByLabelText("Что произошло") as HTMLTextAreaElement).value).toContain(
      "Ребенок резко ответил учительнице",
    );
    expect(screen.getByText(/Доформулировать без давления/)).toBeInTheDocument();
    expect(screen.getByText(/Как можно было бы сказать это точнее/)).toBeInTheDocument();
  });

  it("saves the current case locally", () => {
    render(<DialogueCoach />);

    fireEvent.click(screen.getByRole("button", { name: "Пример" }));
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(screen.getByText("Сохранено: 1")).toBeInTheDocument();
    const removedName = ["Р", "ома"].join("");
    expect(window.localStorage.getItem("braintrainings-dialogue-coach-saved-cases")).toContain("Партнер");
    expect(window.localStorage.getItem("braintrainings-dialogue-coach-saved-cases")).not.toContain(removedName);
  });

  it("saves personal library shortcuts locally", () => {
    render(<DialogueCoach />);

    fireEvent.click(screen.getByRole("button", { name: "Пример" }));
    fireEvent.click(screen.getByRole("button", { name: "Триггер" }));
    fireEvent.click(screen.getByRole("button", { name: "Фраза" }));
    fireEvent.click(screen.getByRole("button", { name: "Пауза" }));

    expect(screen.getByText("Записей: 3")).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem("braintrainings-dialogue-coach-personal-library") || "{}");
    expect(stored.triggers[0].value).toContain("меня не выбрали");
    expect(stored.safePhrases[0].value).toContain("Я пока");
    expect(stored.pausePhrases[0].value).toContain("вернусь");
  });

  it("cycles into male-perspective examples", () => {
    render(<DialogueCoach />);

    const exampleButton = screen.getByRole("button", { name: "Пример" });
    fireEvent.click(exampleButton);
    fireEvent.click(exampleButton);
    fireEvent.click(exampleButton);

    expect((screen.getByLabelText("Что произошло") as HTMLTextAreaElement).value).toContain(
      "Партнерша сказала",
    );
    expect((screen.getByLabelText("Самый болезненный страх") as HTMLTextAreaElement).value).toContain(
      "недостаточно хорошим",
    );

    fireEvent.click(screen.getByRole("button", { name: "Работа" }));
    fireEvent.click(exampleButton);
    fireEvent.click(exampleButton);
    fireEvent.click(exampleButton);

    expect((screen.getByLabelText("Что произошло") as HTMLTextAreaElement).value).toContain(
      "руководитель перебил меня",
    );
  });
});
