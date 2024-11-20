import { useAuth } from "@/components/AuthContext";
import ThemeToggle from "@/components/Navbar/ThemeToggle";
import { UsersIcon } from "@heroicons/react/24/outline";
import {
  Bars3Icon,
  HashtagIcon,
  HomeIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const routes = [
    {
      name: user ? "Profile" : "Login",
      href: `/project2/${user ? `user/${user.username}` : "login"}`,
      icon: user ? (
        <UserIcon className="size-5" />
      ) : (
        <LogInIcon className="size-5" />
      ),
    },
    {
      name: "Homepage",
      href: "/project2",
      icon: <HomeIcon className="size-5" />,
    },
    {
      name: "Users",
      href: "/project2/users",
      icon: <UsersIcon className="size-5" />,
    },
    {
      name: "Trending",
      href: "/project2/hashtag",
      icon: <HashtagIcon className="size-5" />,
    },
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
    <div className="relative block lg:hidden" ref={menuRef}>
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
            <XMarkIcon className="size-8" />
          ) : (
            <Bars3Icon className="size-8" />
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
            className="flex flex-row items-center gap-2 p-2 text-lg hover:bg-gray-200 dark:hover:bg-gray-900"
          >
            {route.icon}
            {route.name}
          </a>
        ))}
        <ThemeToggle />
        {user && (
          <button
            onClick={() => {
              logout();
              closeMenu();
            }}
            className="flex w-full flex-row items-center gap-2 p-2 text-left text-lg hover:bg-gray-200 dark:hover:bg-gray-900"
          >
            <LogOutIcon className="size-5" />
            Log out
          </button>
        )}
      </div>
    </div>
  );
};
