import { useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { SEARCH_ALL } from "@/queries/search";
import Post from "@/components/Post/Post";
import { PostType, UserType } from "@/lib/types";
import ProfileCard from "@/components/ProfileCard";
import { useState } from "react";
import { FilterIcon } from "lucide-react";

type SearchResult = PostType | UserType;

const SearchPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";
  const [filterType, setFilterType] = useState<"all" | "post" | "user">("all");

  const { data, loading, error } = useQuery<{ searchAll: SearchResult[] }>(
    SEARCH_ALL,
    {
      variables: { query: searchQuery },
      skip: !searchQuery,
    },
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredResults =
    data?.searchAll.filter((item) => {
      if (filterType === "post") return item.__typename === "Post";
      if (filterType === "user") return item.__typename === "User";
      return true;
    }) || [];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center justify-center px-4">
      <h1 className="my-4 text-center text-2xl font-bold">
        Search results for: {searchQuery}
      </h1>
      <div className="mb-4 flex items-center gap-2">
        <FilterIcon className="text-gray-800 dark:text-gray-200" />
        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as "all" | "post" | "user")
          }
          className="rounded border border-gray-300 bg-white p-2 outline-none dark:bg-gray-800"
        >
          <option value="all">All</option>
          <option value="post">Posts</option>
          <option value="user">Users</option>
        </select>
      </div>
      {filteredResults.length > 0 ? (
        <div
          className={`grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`}
        >
          {filteredResults.map((item) =>
            item.__typename === "Post" ? (
              <div
                key={item.id}
                className="col-span-1 flex justify-center sm:col-span-2 lg:col-span-3"
              >
                <Post post={item as PostType} />
              </div>
            ) : (
              <div key={item.id} className="col-span-1 flex justify-center">
                <ProfileCard user={item} />
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500">No results found.</p>
      )}
    </main>
  );
};

export default SearchPage;
