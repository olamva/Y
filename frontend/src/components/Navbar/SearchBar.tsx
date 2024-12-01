import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Username from "@/components/Username";
import useDebounce from "@/hooks/useDebounce";
import { HashtagType, UserType } from "@/lib/types";
import { SEARCH_HASHTAGS, SEARCH_USERS } from "@/queries/search";
import { useQuery } from "@apollo/client";
import { X } from "lucide-react";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

const SearchBar = () => {
  const params = new URLSearchParams(location.search);
  const currentQuery = params.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<
    (HashtagType | UserType | string)[]
  >([]);
  const [suggestionType, setSuggestionType] = useState<
    "user" | "hashtag" | "all"
  >("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const {
    data: hashtagsData,
    loading: hashtagsLoading,
    refetch: refetchHashtags,
  } = useQuery<{ searchHashtags: HashtagType[] }>(SEARCH_HASHTAGS, {
    variables: { query: debouncedQuery, page: 1, limit: 5 },
    skip: !showSuggestions || suggestionType === "user",
  });

  const {
    data: mentionsData,
    loading: mentionsLoading,
    refetch: refetchUsers,
  } = useQuery<{ searchUsers: UserType[] }>(SEARCH_USERS, {
    variables: { query: debouncedQuery, page: 1, limit: 5 },
    skip: !showSuggestions || suggestionType === "hashtag",
  });

  useEffect(() => {
    if (showSuggestions) {
      refetchHashtags();
      refetchUsers();
    }
  }, [debouncedQuery, refetchHashtags, refetchUsers, showSuggestions]);

  useEffect(() => {
    const storedTerms = JSON.parse(
      sessionStorage.getItem("searchTerms") || "[]",
    );
    const filteredTerms = storedTerms.filter((term: string) =>
      term.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    setSuggestions([
      ...filteredTerms,
      ...(hashtagsData?.searchHashtags ?? []),
      ...(mentionsData?.searchUsers ?? []),
    ]);
  }, [hashtagsData, mentionsData, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const saveSearchTerm = (term: string) => {
    const storedTerms = JSON.parse(
      sessionStorage.getItem("searchTerms") || "[]",
    );
    const updatedTerms = [
      term,
      ...storedTerms.filter((t: string) => t !== term),
    ].slice(0, 3);
    sessionStorage.setItem("searchTerms", JSON.stringify(updatedTerms));
  };

  const removeSearchTerm = (term: string) => {
    const storedTerms = JSON.parse(
      sessionStorage.getItem("searchTerms") || "[]",
    );
    const updatedTerms = storedTerms.filter((t: string) => t !== term);
    sessionStorage.setItem("searchTerms", JSON.stringify(updatedTerms));
    setSuggestions((prevSuggestions) =>
      prevSuggestions.filter((suggestion) => suggestion !== term),
    );
  };

  const handleSearch = () => {
    if (activeSuggestionIndex === 0 || suggestions.length === 0) {
      if (searchQuery.trim().length === 0) return;
      saveSearchTerm(searchQuery);
      window.location.href = `/project2/search?q=${encodeURIComponent(
        searchQuery,
      )}`;
      return;
    }
    const selectedSuggestion = suggestions[activeSuggestionIndex - 1];
    if (typeof selectedSuggestion === "string") {
      window.location.href = `/project2/search?q=${encodeURIComponent(
        selectedSuggestion,
      )}`;
    } else {
      if (selectedSuggestion.__typename === "User") {
        window.location.href = `/project2/user/${selectedSuggestion.username}`;
        saveSearchTerm(`@${selectedSuggestion.username}`);
        return;
      } else {
        window.location.href = `/project2/hashtag/${selectedSuggestion.tag}`;
        saveSearchTerm(`#${selectedSuggestion.tag}`);
        return;
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.startsWith("#")) {
      setSuggestionType("hashtag");
      setSearchQuery(e.target.value);
    } else if (e.target.value.startsWith("@")) {
      setSuggestionType("user");
      setSearchQuery(e.target.value);
    } else {
      setSuggestionType("all");
      setSearchQuery(e.target.value);
    }
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
    const maxIndex = suggestions.length > 5 ? 5 : suggestions.length;
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex === maxIndex ? 0 : prevIndex + 1,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex === 0 ? maxIndex : prevIndex - 1,
        );
      }
    }
  };

  return (
    <Popover open={showSuggestions}>
      <PopoverTrigger asChild>
        <input
          ref={inputRef}
          type="search"
          id="search"
          aria-label="Search field"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="suggestions-list"
          maxLength={40}
          placeholder="Search here..."
          autoComplete="off"
          className="w-full max-w-xs rounded-md bg-gray-100 p-2 outline-none dark:bg-gray-800"
          value={searchQuery}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          onClick={() => setShowSuggestions(true)}
          onMouseEnter={() => setActiveSuggestionIndex(0)}
        />
      </PopoverTrigger>
      {suggestions.length > 0 && (
        <PopoverContent
          ref={popoverRef}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-[70] w-fit overflow-hidden p-0"
          align="start"
        >
          {hashtagsLoading || mentionsLoading ? (
            <p className="w-fit p-2">Loading...</p>
          ) : (
            <div className="flex w-80 appearance-none flex-col overflow-hidden outline-none">
              {suggestions.slice(0, 5).map((suggestion, index) =>
                typeof suggestion === "string" ? (
                  <div
                    key={suggestion}
                    className={`flex w-full cursor-pointer items-center gap-1 p-2 ${
                      index + 1 === activeSuggestionIndex
                        ? "bg-blue-500 text-white dark:bg-blue-800"
                        : ""
                    }`}
                    onMouseEnter={() => setActiveSuggestionIndex(index + 1)}
                  >
                    <a
                      href={`/project2/search?q=${encodeURIComponent(
                        suggestion,
                      )}`}
                      className="flex-grow"
                    >
                      <p>{suggestion}</p>
                    </a>
                    <X
                      onClick={() => removeSearchTerm(suggestion)}
                      className={`size-4 ${index + 1 === activeSuggestionIndex ? "text-white" : "text-red-500"}`}
                    />
                  </div>
                ) : (
                  <a
                    key={
                      suggestion.__typename === "User"
                        ? suggestion.id
                        : suggestion.tag
                    }
                    className={`flex w-full cursor-pointer items-center gap-1 p-2 ${
                      index + 1 === activeSuggestionIndex
                        ? "bg-blue-500 text-white dark:bg-blue-800"
                        : ""
                    }`}
                    href={`/project2/${
                      suggestion.__typename === "User"
                        ? `user/${suggestion.username}`
                        : `hashtag/${suggestion.tag}`
                    }`}
                    onClick={() =>
                      saveSearchTerm(
                        suggestion.__typename === "User"
                          ? `@${suggestion.username}`
                          : `#${suggestion.tag}`,
                      )
                    }
                    onMouseEnter={() => setActiveSuggestionIndex(index + 1)}
                  >
                    {suggestion.__typename === "User" ? (
                      <Username
                        noHref
                        user={suggestion}
                        customBadgeColors={
                          index + 1 === activeSuggestionIndex
                            ? "text-white"
                            : "text-blue-500 dark:text-blue-400"
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="flex size-8 h-full items-center justify-center text-2xl">
                          #
                        </span>
                        <p>{suggestion.tag}</p>
                      </div>
                    )}
                  </a>
                ),
              )}
            </div>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
};

export default SearchBar;
