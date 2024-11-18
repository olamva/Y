import { useAuth } from "@/components/AuthContext";
import { DropdownMenu } from "@/components/Navbar/DropdownMenu";
import ThemeToggle from "@/components/Navbar/ThemeToggle";
import Avatar from "@/components/Profile/Avatar";
import { FormEvent, useState } from "react";

const Navbar = () => {
  const params = new URLSearchParams(location.search);
  const currentQuery = params.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const { logout, user } = useAuth();

  const navigateSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
    window.location.href = `/project2/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const login = () => {
    window.location.href = "/project2/login";
  };

  return (
    <>
      <nav className="fixed z-[100] flex h-20 w-full items-center justify-between bg-gray-200/40 px-5 py-5 backdrop-blur-sm dark:bg-gray-950/80">
        <a
          href="/project2"
          className="group flex items-center justify-center gap-5 hover:scale-110 hover:text-gray-300"
        >
          <h1 className="text-2xl font-semibold sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl">
            <span className="group-hover:text-gray-600 group-hover:dark:text-gray-300">
              Y
            </span>
          </h1>
        </a>

        <div className="mx-4 flex max-w-xs flex-1 items-center justify-center gap-2 sm:max-w-lg md:justify-end">
          <form onSubmit={navigateSearch}>
            <input
              type="search"
              id="search"
              maxLength={40}
              placeholder="Search here..."
              className="w-full rounded-md bg-gray-100 p-2 outline-none dark:bg-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              {user && (
                <div className="mr-2">
                  <Avatar user={user} large={false} />{" "}
                </div>
              )}
              {user ? (
                <button
                  onClick={logout}
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Log out
                </button>
              ) : (
                <button
                  onClick={login}
                  className="rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu />
      </nav>
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;
