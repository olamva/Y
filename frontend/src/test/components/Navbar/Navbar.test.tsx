import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar/Navbar";
import { vi, describe, it, expect } from "vitest";
import { MockedProvider } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";
import { useAuth } from "@/components/AuthContext";

vi.mock("@/components/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { username: "testuser" },
    logout: vi.fn(),
  }),
}));

// mocks the debounce to make testing faster, we are not making api calls anyway
vi.mock("@/hooks/useDebounce", () => ({
  default: vi.fn((value) => value),
}));

describe("Navbar", () => {
  it("renders the navbar with essential elements", () => {
    render(
      <MockedProvider>
        <Navbar />
      </MockedProvider>,
    );

    const logoElement = screen.getByRole("link", { name: /Y/i });
    expect(logoElement).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search here.../i);
    expect(searchInput).toBeInTheDocument();

    // add themtoggle and put log out button test outside

    const logoutButtons = screen.getAllByText(/Log out/i);
    expect(logoutButtons).toHaveLength(2);
    expect(logoutButtons[0]).toBeInTheDocument();
    expect(logoutButtons[1]).toBeInTheDocument();
  });

  it("shows login button when user is not logged in", () => {
    vi.mocked(useAuth).mockReturnValue({
      logout: vi.fn(),
    });

    render(
      <MockedProvider>
        <Navbar />
      </MockedProvider>,
    );

    const loginButton = screen.getByText(/Log in/i);
    expect(loginButton).toBeInTheDocument();
  });

  it("handles search input correctly", async () => {
    render(
      <MockedProvider>
        <Navbar />
      </MockedProvider>,
    );

    const searchInput = screen.getByPlaceholderText(/Search here/i);

    await userEvent.type(searchInput, "test query");
    expect(searchInput).toHaveValue("test query");
  });

  it("matches the snapshot", () => {
    const { container } = render(
      <MockedProvider>
        <Navbar />
      </MockedProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
