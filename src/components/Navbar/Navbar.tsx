import { UserCircleIcon } from "@heroicons/react/24/outline";
import { DropdownMenu } from "./DropdownMenu";
import ThemeToggle from "./ThemeToggle";

export const Navbar = () => {
  return (
    <div className="bg-gray-950/80  w-full text-white">
      <div className="w-full flex justify-center">
        <nav className="flex items-center justify-between flex-wrap py-5 w-full px-5">
          <a
            href={"/"}
            className="flex items-center justify-center gap-5 group hover:text-gray-300"
          >
            <h1 className="font-semibold text-2xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl">
              <span className="group-hover:text-gray-300">Y</span>
            </h1>
          </a>

          <div className="flex flex-row gap-2 text-center hidden md:flex">
            <ThemeToggle />
            <input
              type="search"
              placeholder="Search here..."
              className="bg-gray-800 text-white p-2 rounded-md"
            />
            <a className="p-2" href="/">
              <UserCircleIcon className="h-8 w-8" />
            </a>
          </div>
          <DropdownMenu />
        </nav>
      </div>
    </div>
  );
};
