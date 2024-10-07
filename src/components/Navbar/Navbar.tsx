import { UserCircleIcon } from "@heroicons/react/24/outline";
import { DropdownMenu } from "./DropdownMenu";
import ThemeToggle from "./ThemeToggle";

export const Navbar = () => {
  return (
    <div className="w-full bg-gray-950/80 text-white">
      <div className="flex w-full justify-center">
        <nav className="flex w-full flex-wrap items-center justify-between px-5 py-5">
          <a
            href={"/"}
            className="group flex items-center justify-center gap-5 hover:scale-110 hover:text-gray-300"
          >
            <h1 className="text-2xl font-semibold sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl">
              <span className="group-hover:text-gray-300">Y</span>
            </h1>
          </a>
          <div className="hidden flex-row items-center justify-center gap-2 text-center md:flex">
            <ThemeToggle />
            <input
              type="search"
              placeholder="Search here..."
              className="rounded-md bg-gray-800 p-2 text-white"
            />
            <a className="p-2 hover:scale-110" href="/">
              <UserCircleIcon className="size-8" />
            </a>
          </div>
          <DropdownMenu />
        </nav>
      </div>
    </div>
  );
};
