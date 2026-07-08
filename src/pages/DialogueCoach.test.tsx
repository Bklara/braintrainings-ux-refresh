import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DialogueCoach } from "./DialogueCoach";

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
});
