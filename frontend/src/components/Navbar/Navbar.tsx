import { useAuth } from "@/components/AuthContext";
import { DropdownMenu } from "@/components/Navbar/DropdownMenu";
import Notifications from "@/components/Navbar/Notifications/Notifications";
import SearchBar from "@/components/Navbar/SearchBar";
import ThemeToggle from "@/components/Navbar/ThemeToggle";
import Avatar from "@/components/Profile/Avatar";
import Username from "@/components/Username";

const Navbar = () => {
  const { logout, user } = useAuth();

  const login = () => {
    window.location.href = "/project2/login";
  };

  return (
    <>
      <nav className="fixed z-[60] flex h-20 w-full items-center justify-between bg-gray-200/80 px-5 py-5 backdrop-blur-sm dark:bg-gray-950/80">
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

        <div className="mx-2 flex flex-1 items-center gap-2">
          <div className="flex flex-1 items-center justify-center gap-2 lg:justify-end">
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
                      <Username hideFullName smallBadge user={user} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {user && <Notifications />}
          <div className="hidden lg:flex">
            {user ? (
              <button
                onClick={logout}
                aria-label="Log out"
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Log out
              </button>
            ) : (
              <button
                onClick={login}
                aria-label="Log in"
                className="rounded-md bg-green-400 px-3 py-2 text-sm font-semibold text-black hover:bg-green-500"
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
