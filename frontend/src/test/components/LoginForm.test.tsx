import LoginForm from "@/form/LoginForm";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/queries/user";
import { MockedProvider } from "@apollo/client/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(), // This makes `useNavigate` a mock function
}));

beforeEach(() => {
  vi.clearAllMocks(); // Clears all mocks before each test
});

vi.mock("@/components/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { username: "testuser" },
    logout: vi.fn(),
  }),
}));

const mocks = [
  {
    request: {
      query: LOGIN_MUTATION,
      variables: {
        username: "testuser",
        password: "password123",
      },
    },
    result: {
      data: {
        login: {
          username: "testuser",
          token: "dummy-token",
        },
      },
    },
  },
  {
    request: {
      query: REGISTER_MUTATION,
      variables: {
        username: "newuser",
        password: "password123",
      },
    },
    result: {
      data: {
        register: {
          username: "newuser",
          token: "dummy-token",
        },
      },
    },
  },
];

describe("LoginForm", () => {
  it("should render login form and submit login", async () => {
    const navigate = useNavigate;

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LoginForm view="login" />
      </MockedProvider>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByRole("button", { name: /password/i }), {
      target: { value: "password123" },
    });

    const buttons = screen.getAllByRole("button", { name: /login/i });
    const submitButton = buttons[0];
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalled();
    });
  });

  it("should render register form and submit registration", async () => {
    const navigate = useNavigate;

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LoginForm view="register" />
      </MockedProvider>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "newuser" },
    });
    const [passwordInput, confirmPasswordInput] =
      screen.getAllByLabelText(/password/i);

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalled();
    });
  });

  it("should show error for password mismatch during registration", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LoginForm view="register" />
      </MockedProvider>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "newuser" },
    });

    const [passwordInput, confirmPasswordInput] =
      screen.getAllByLabelText(/password/i);

    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "differentpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() =>
      expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument(),
    );
  });

  it("should disable the submit button while loading", () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LoginForm view="login" />
      </MockedProvider>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByRole("input", { name: /password/i }), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getAllByRole("button")[1]).toBeDisabled();
  });
});
