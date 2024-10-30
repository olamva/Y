import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/queries/user";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ confirmPassword?: string }>({});
  const { login } = useAuth();

  const [loginMutation, { loading: loginLoading }] =
    useMutation(LOGIN_MUTATION);
  const [registerMutation, { loading: registerLoading }] =
    useMutation(REGISTER_MUTATION);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({
        variables: {
          username: formData.username,
          password: formData.password,
        },
      });
      if (data.login) {
        login(data.login);
        toast.success("Logged in successfully!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error logging in: ${error.message}`);
      } else {
        toast.error("Error logging in");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      const { data } = await registerMutation({
        variables: {
          username: formData.username,
          password: formData.password,
        },
      });
      if (data.register) {
        login(data.register); // Update AuthContext
        toast.success("Registered and logged in successfully!");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error registering: ${error.message}`);
      } else {
        toast.error("Error registering");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-96 rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {isLogin ? "Login" : "Register"}
        </h1>
        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              required
            />
          </div>
          {!isLogin && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loginLoading || registerLoading}
            className={`flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              (loginLoading || registerLoading) &&
              "cursor-not-allowed opacity-50"
            }`}
          >
            {isLogin
              ? loginLoading
                ? "Logging in..."
                : "Login"
              : registerLoading
                ? "Registering..."
                : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
