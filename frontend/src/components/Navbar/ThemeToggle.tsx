import {
  MoonIcon as MoonIconSolid,
  SunIcon as SunIconSolid,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

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
      <div className="hidden size-6 md:block">
        <button className="group rounded-full" onClick={toggleTheme}>
          {theme === "dark" ? (
            <MoonIconSolid className="size-6 transition-transform duration-300 ease-in-out group-hover:scale-110" />
          ) : (
            <SunIconSolid className="size-6 transition-transform duration-300 ease-in-out group-hover:scale-110" />
          )}
        </button>
      </div>
      <div className="md:hidden">
        <button
          className="flex w-full flex-row items-center gap-2 px-4 py-2 text-left text-lg hover:bg-gray-500 dark:hover:bg-gray-900"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <SunIconSolid className="size-5" />
          ) : (
            <MoonIconSolid className="size-5" />
          )}
          {theme === "dark" ? <p>Lightmode</p> : <p>Darkmode</p>}
        </button>
      </div>
    </>
  );
};

export default ThemeToggle;
