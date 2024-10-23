import Post from "@/components/Post";
import { mockData } from "@/lib/mockupData";

const HomePage = () => {
  return (
    <main className="flex w-full flex-col items-center">
      {mockData.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </main>
  );
};

export default HomePage;
