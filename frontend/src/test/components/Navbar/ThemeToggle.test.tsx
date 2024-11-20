import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/components/Navbar/ThemeToggle";
import { expect, describe, it, beforeEach } from "vitest";

describe("ThemeToggle", () => {
  beforeEach(() => {
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        clear: () => {
          store = {};
        },
      };
    })();

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
  });

  it("renders with default theme set to lightmode", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", {
      name: /Switch to dark theme/i,
    });
    expect(button).toBeInTheDocument();
    expect(document.documentElement.classList).not.toContain("dark");
  });

  it("switches to dark mode when the toggle is clicked", async () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", {
      name: /Switch to dark theme/i,
    });

    await userEvent.click(button);

    expect(document.documentElement.classList).toContain("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    expect(button).toHaveAttribute("aria-label", "Switch to light theme");
  });

  it("switches back to light mode when the toggle is clicked again", async () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", {
      name: /Switch to dark theme/i,
    });

    await userEvent.click(button);
    expect(document.documentElement.classList).toContain("dark");

    await userEvent.click(button);
    expect(document.documentElement.classList).not.toContain("dark");
    expect(localStorage.getItem("theme")).toBe("light");

    expect(button).toHaveAttribute("aria-label", "Switch to dark theme");
  });

  it("uses localStorage theme on initial render", () => {
    localStorage.setItem("theme", "dark");

    render(<ThemeToggle />);

    expect(document.documentElement.classList).toContain("dark");

    const button = screen.getByRole("button", {
      name: /Switch to light theme/i,
    });
    expect(button).toBeInTheDocument();
  });
});
