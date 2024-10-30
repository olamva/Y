import { useAuth } from "@/components/AuthContext";
import ThemeToggle from "@/components/Navbar/ThemeToggle";
import {
  Bars3Icon,
  HomeIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { LogInIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const routes = [
    {
      name: user ? "Profile" : "Login",
      href: "/project2/user",
      icon: user ? (
        <UserIcon className="size-5" />
      ) : (
        <LogInIcon className="size-5" />
      ),
    },
    { name: "Homepage", href: "/", icon: <HomeIcon className="size-5" /> },
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
            <XMarkIcon className="h-8 w-8 text-white" />
          ) : (
            <Bars3Icon className="h-8 w-8 text-white" />
          )}
        </div>
      </div>

      <div
        className={`absolute right-0 top-12 z-50 mt-2 w-48 overflow-hidden rounded-md border border-gray-500 bg-gray-300 text-gray-900 shadow-lg transition-all duration-300 dark:bg-gray-800 dark:text-white ${
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {routes.map((route, i: number) => (
          <a
            href={route.href}
            key={i}
            onClick={closeMenu}
            className="flex flex-row items-center gap-2 px-4 py-2 text-lg hover:bg-gray-500 dark:hover:bg-gray-900"
          >
            {route.icon}
            {route.name}
          </a>
        ))}
        <ThemeToggle />
      </div>
    </div>
  );
};
