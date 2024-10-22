import { useLocation } from "react-router-dom";
import { mockData } from "@/lib/mockupData";
import Post from "@/components/Post";

const SearchPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";

  const query = searchQuery.toLowerCase();
  const filteredData = mockData.filter(
    (item) =>
      item.author.toLowerCase().includes(query) ||
      item.body.toLowerCase().includes(query),
  );

  return (
    <main className="flex flex-col items-center">
      <h1 className="my-4 text-2xl font-bold">
        Search results for: {searchQuery}
      </h1>
      {filteredData.length > 0 ? (
        filteredData.map((post) => <Post key={post.id} post={post} />)
      ) : (
        <p className="text-gray-500">No results found.</p>
      )}
    </main>
  );
};

export default SearchPage;
