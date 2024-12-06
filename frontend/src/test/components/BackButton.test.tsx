import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi, expect } from "vitest";
import BackButton from "@/components/ui/BackButton";

describe("BackButton", () => {
  it("renders the button with the text 'Back'", () => {
    render(<BackButton />);
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("calls window.history.back() when clicked", async () => {
    const user = userEvent.setup();
    const mockBack = vi.spyOn(window.history, "back");

    render(<BackButton />);
    const button = screen.getByText("Back");
    await user.click(button);

    expect(mockBack).toHaveBeenCalledOnce();
    mockBack.mockRestore();
  });
});
