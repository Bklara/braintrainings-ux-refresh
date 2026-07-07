import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DialogueCoach } from "./DialogueCoach";

describe("DialogueCoach", () => {
  it("renders the coach as the first usable screen", () => {
    render(<DialogueCoach />);

    expect(screen.getByRole("heading", { name: "Тренажер сложного разговора" })).toBeInTheDocument();
    expect(screen.getByLabelText("Что произошло")).toBeInTheDocument();
    expect(screen.getByText("Разбор появится здесь")).toBeInTheDocument();
  });

  it("loads the partner example and shows the breakup-safe coach state", () => {
    render(<DialogueCoach />);

    fireEvent.click(screen.getByRole("button", { name: "Пример" }));

    expect((screen.getByLabelText("Что произошло") as HTMLTextAreaElement).value).toContain("Рома сказал");
    expect(screen.getByText(/Расставание: сохранить себя/)).toBeInTheDocument();
    expect(screen.getByText("Фраза")).toBeInTheDocument();
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
});
