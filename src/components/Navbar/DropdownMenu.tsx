import { useState, useRef, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "./ThemeToggle";

export const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const routes = [
    { name: "Profile", href: "/" },
    { name: "Homepage", href: "/" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="relative block md:hidden" ref={menuRef}>
      <div
        onClick={toggleMenu}
        className="cursor-pointer transition-transform duration-300"
      >
        <div
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          {isOpen ? (
            <Bars3Icon className="text-white h-8 w-8" />
          ) : (
            <XMarkIcon className="text-white h-8 w-8" />
          )}
        </div>
      </div>

      <div
        className={`absolute right-0 mt-2 top-12 w-48 z-50 bg-gray-300 dark:bg-gray-800 border border-gray-500 text-gray-900 dark:text-white  rounded-md shadow-lg transition-all duration-300 ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {routes.map((route) => (
          <a
            href={route.href}
            key={route.href}
            onClick={closeMenu}
            className="block px-4 py-2 text-lg hover:bg-gray-500 dark:hover:bg-gray-900"
          >
            {route.name}
          </a>
        ))}
        <ThemeToggle />
      </div>
    </div>
  );
};
