import Footer from "@/components/Footer";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Footer", () => {
  it("renders the footer with the correct copyright year", () => {
    const { container } = render(<Footer />);
    const copyrightText = container.querySelector("p");

    expect(copyrightText).toBeInTheDocument();
    expect(copyrightText?.textContent).toContain(
      new Date().getFullYear().toString(),
    );
  });

  it("renders correctly in the DOM", () => {
    const { asFragment } = render(<Footer />);
    expect(asFragment()).toMatchSnapshot();
  });
});
