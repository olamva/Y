import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedTheme = window.localStorage.getItem("theme");
      return storedTheme ? storedTheme : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <div className="hidden md:block">
        <button
          onClick={toggleTheme}
          className={`mx-4 h-10 w-16 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-300"
          }`}
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
        >
          <div
            className={`flex h-8 w-8 transform items-center justify-center rounded-full transition-transform duration-300 ${
              theme === "dark"
                ? "translate-x-6 bg-gray-800"
                : "translate-x-0 bg-white"
            }`}
          >
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-yellow-300" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </button>
      </div>
      <div className="md:hidden">
        <button
          className="flex w-full flex-row items-center gap-2 p-2 text-left text-lg hover:bg-gray-200 dark:hover:bg-gray-900"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          {theme === "dark" ? <p>Light Mode</p> : <p>Dark Mode</p>}
        </button>
      </div>
    </>
  );
};

export default ThemeToggle;
