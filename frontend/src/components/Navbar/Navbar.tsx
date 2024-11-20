import { useAuth } from "@/components/AuthContext";
import { DropdownMenu } from "@/components/Navbar/DropdownMenu";
import ThemeToggle from "@/components/Navbar/ThemeToggle";
import Avatar from "../Profile/Avatar";
import Username from "../Username";
import Notifications from "./Notifications/Notifications";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const { logout, user } = useAuth();

  const login = () => {
    window.location.href = "/project2/login";
  };

  return (
    <>
      <nav className="fixed z-[60] flex h-20 w-full items-center justify-between bg-gray-200/40 px-5 py-5 backdrop-blur-sm dark:bg-gray-950/80">
        <a
          href="/project2"
          className="group flex items-center justify-center gap-5 hover:scale-110 hover:text-gray-300"
        >
          <h1 className="sm:text-2x text-2xl font-semibold lg:text-2xl xl:text-3xl">
            <span className="group-hover:text-gray-600 group-hover:dark:text-gray-300">
              Y
            </span>
          </h1>
        </a>

        <div className="mx-2 flex flex-1 items-center justify-center gap-2 lg:justify-end">
          <SearchBar />
          <div className="hidden min-w-fit items-center gap-2 lg:flex">
            <ThemeToggle />
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="xl:hidden">
                    <Avatar user={user} />
                  </div>
                  <div className="hidden xl:block">
                    <Username user={user} />
                  </div>
                </>
              )}
            </div>
          </div>
          {user && (
            <div className="flex items-center justify-center lg:mx-2">
              <Notifications />
            </div>
          )}
          <div className="hidden lg:flex">
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
        <DropdownMenu />
      </nav>
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;
