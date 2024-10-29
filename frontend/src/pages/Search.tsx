import { useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { SEARCH_ALL } from "@/queries/search";
import Post from "@/components/Post";
import { PostType, UserType } from "@/lib/types"; // Assuming these types are defined

type SearchResult = PostType | UserType;

const SearchPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";

  // Execute the search query
  const { data, loading, error } = useQuery<{ searchAll: SearchResult[] }>(
    SEARCH_ALL,
    {
      variables: { query: searchQuery },
      skip: !searchQuery, // Skip query if searchQuery is empty
    },
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const results = data?.searchAll || [];

  return (
    <main className="flex flex-col items-center">
      <h1 className="my-4 text-2xl font-bold">
        Search results for: {searchQuery}
      </h1>
      {results.length > 0 ? (
        results.map((item) =>
          item.__typename === "Post" ? (
            <Post key={item.id} post={item as PostType} />
          ) : (
            //TODO create User card component
            <div key={item.id} className="border-b p-4">
              <p>User: {(item as UserType).username}</p>
            </div>
          ),
        )
      ) : (
        <p className="text-gray-500">No results found.</p>
      )}
    </main>
  );
};

export default SearchPage;
