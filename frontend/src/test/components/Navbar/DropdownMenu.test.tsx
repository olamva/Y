import { DropdownMenu } from "@/components/Navbar/DropdownMenu";
import { useAuth } from "@/hooks/AuthContext";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { username: "testuser" },
    logout: vi.fn(),
  }),
}));

describe("DropdownMenu", () => {
  it("matches the snapshot", () => {
    const { container } = render(
      <MockedProvider>
        <DropdownMenu />
      </MockedProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders the dropdown toggle Bars3Icon by default", () => {
    render(<DropdownMenu />);

    const barsIcon = screen.getByTestId("bars-icon");
    expect(barsIcon).toBeInTheDocument();
    expect(barsIcon).toBeVisible();
  });

  it("toggles the dropdown when clicked, showing XMarkIcon when open", async () => {
    render(<DropdownMenu />);

    let barsIcon = screen.getByTestId("bars-icon");
    expect(barsIcon).toBeInTheDocument();
    expect(barsIcon).toBeVisible();

    await userEvent.click(barsIcon);

    const xMarkIcon = screen.getByTestId("xmark-icon");
    expect(xMarkIcon).toBeInTheDocument();
    expect(xMarkIcon).toBeVisible();

    await userEvent.click(xMarkIcon);

    barsIcon = screen.getByTestId("bars-icon");
    expect(barsIcon).toBeInTheDocument();
    expect(barsIcon).toBeVisible();
  });

  it("renders the correct routes", () => {
    render(<DropdownMenu />);

    const routes = [
      { name: "Profile", href: "/project2/user/testuser" },
      { name: "Homepage", href: "/project2" },
      { name: "Users", href: "/project2/users" },
      { name: "Trending", href: "/project2/hashtag" },
    ];

    routes.forEach((route) => {
      const routeLink = screen.getByText(route.name);
      expect(routeLink).toBeInTheDocument();
      expect(routeLink.closest("a")).toHaveAttribute("href", route.href);
    });
  });

  it("renders the logout button for logged-in users", () => {
    render(<DropdownMenu />);
    const logoutButton = screen.getByText(/Log out/i);
    expect(logoutButton).toBeInTheDocument();
  });

  it("renders the correct routes when user is logged out", () => {
    vi.mocked(useAuth).mockReturnValue({
      logout: vi.fn(),
      isLoggedIn: false,
      token: null,
      user: null,
      login: vi.fn(),
      following: [],
      setFollowing: vi.fn(),
      refetchUser: vi.fn(),
    });

    render(<DropdownMenu />);

    // Adjust the routes for the logged-out state
    const routes = [
      { name: "Login", href: "/project2/login" },
      { name: "Homepage", href: "/project2" },
      { name: "Users", href: "/project2/users" },
      { name: "Trending", href: "/project2/hashtag" },
    ];

    routes.forEach((route) => {
      const routeLink = screen.getByText(route.name);
      expect(routeLink).toBeInTheDocument();
      expect(routeLink.closest("a")).toHaveAttribute("href", route.href);
    });
  });
});
