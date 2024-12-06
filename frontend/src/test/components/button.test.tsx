import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders the default button", () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole("button", { name: /default button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("inline-flex items-center justify-center");
  });

  it("renders the button with custom variant and size", () => {
    render(
      <Button variant="outline" size="lg">
        Custom Button
      </Button>,
    );
    const button = screen.getByRole("button", { name: /custom button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("border border-neutral-200 bg-white");
    expect(button).toHaveClass("h-10 rounded-md px-8");
  });

  it("triggers the onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);

    const button = screen.getByRole("button", { name: /clickable button/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("renders as a different element when 'asChild' is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("applies additional class names", () => {
    render(<Button className="custom-class">Styled Button</Button>);
    const button = screen.getByRole("button", { name: /styled button/i });
    expect(button).toHaveClass("custom-class");
  });
});
