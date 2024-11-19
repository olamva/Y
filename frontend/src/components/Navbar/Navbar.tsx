import { useAuth } from "@/components/AuthContext";
import { DropdownMenu } from "@/components/Navbar/DropdownMenu";
import ThemeToggle from "@/components/Navbar/ThemeToggle";
import Avatar from "@/components/Profile/Avatar";
import useDebounce from "@/hooks/useDebounce";
import { HashtagType, UserType } from "@/lib/types";
import { SEARCH_HASHTAGS, SEARCH_USERS } from "@/queries/search";
import { useQuery } from "@apollo/client";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const Navbar = () => {
  const params = new URLSearchParams(location.search);
  const currentQuery = params.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const { logout, user } = useAuth();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<(HashtagType | UserType)[]>(
    [],
  );

  const debouncedQuery = useDebounce(searchQuery, 300);

  const {
    data: hashtagsData,
    loading: hashtagsLoading,
    refetch: refetchHashtags,
  } = useQuery<{
    searchHashtags: HashtagType[];
  }>(SEARCH_HASHTAGS, {
    variables: { query: debouncedQuery, page: 1, limit: 5 },
    skip: debouncedQuery.length < 1,
  });

  const {
    data: mentionsData,
    loading: mentionsLoading,
    refetch: refetchUsers,
  } = useQuery<{
    searchUsers: UserType[];
  }>(SEARCH_USERS, {
    variables: { query: debouncedQuery, page: 1, limit: 5 },
    skip: debouncedQuery.length < 1,
  });

  useEffect(() => {
    if (debouncedQuery.length > 0) {
      refetchHashtags();
      refetchUsers();
    }
  }, [debouncedQuery, refetchHashtags, refetchUsers]);

  useEffect(() => {
    setSuggestions([
      ...(hashtagsData?.searchHashtags ?? []),
      ...(mentionsData?.searchUsers ?? []),
    ]);
  }, [hashtagsData, mentionsData]);

  const handleSearch = () => {
    if (activeSuggestionIndex === 0 || suggestions.length === 0) {
      window.location.href = `/project2/search?q=${encodeURIComponent(
        searchQuery,
      )}`;
      return;
    }
    const selectedSuggestion = suggestions[activeSuggestionIndex - 1];
    window.location.href = `/project2/${
      selectedSuggestion.__typename === "User"
        ? `user/${selectedSuggestion.username}`
        : `hashtag/${selectedSuggestion.tag}`
    }`;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!showSuggestions) {
      setShowSuggestions(true);
      setActiveSuggestionIndex(0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
      return;
    }
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex === suggestions.length - 2 ? 0 : prevIndex + 1,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex === 0 ? suggestions.length - 2 : prevIndex - 1,
        );
      }
    }
  };

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

        <div className="mx-4 flex max-w-xs flex-1 items-center justify-center gap-2 sm:max-w-lg lg:justify-end">
          <Popover open={showSuggestions}>
            <PopoverTrigger asChild>
              <input
                type="search"
                id="search"
                maxLength={40}
                placeholder="Search here..."
                autoComplete="off"
                className="w-full rounded-md bg-gray-100 p-2 outline-none dark:bg-gray-800"
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                onMouseEnter={() => setActiveSuggestionIndex(0)}
              />
            </PopoverTrigger>
            {suggestions.length > 0 && (
              <PopoverContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="z-[70] overflow-hidden p-0"
              >
                {hashtagsLoading || mentionsLoading ? (
                  <p className="w-full p-2">Loading...</p>
                ) : (
                  <div className="flex w-full appearance-none flex-col overflow-hidden outline-none">
                    {suggestions.slice(0, 5).map((suggestion, index) => {
                      const isUser = suggestion.__typename === "User";
                      return (
                        <a
                          key={isUser ? suggestion.id : suggestion.tag}
                          className={`flex w-full cursor-pointer items-center gap-2 p-2 ${
                            index + 1 === activeSuggestionIndex
                              ? "bg-blue-500 text-white dark:bg-blue-800"
                              : ""
                          }`}
                          href={`/project2/${
                            isUser
                              ? `user/${suggestion.username}`
                              : `hashtag/${suggestion.tag}`
                          }`}
                          onMouseEnter={() =>
                            setActiveSuggestionIndex(index + 1)
                          }
                        >
                          {isUser ? (
                            <Avatar noHref user={suggestion} />
                          ) : (
                            <p className="flex size-8 h-full items-center justify-center text-2xl">
                              #
                            </p>
                          )}

                          <p>
                            {isUser
                              ? `${suggestion.username}`
                              : `${suggestion.tag}`}
                          </p>
                        </a>
                      );
                    })}
                  </div>
                )}
              </PopoverContent>
            )}
          </Popover>
          <div className="hidden min-w-fit items-center gap-2 lg:flex">
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
