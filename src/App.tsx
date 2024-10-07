import Post from "./components/Post";
import { mockData } from "./lib/mockupData";

const HomePage = () => {
  return (
    <div>
      <h1>App</h1>
      {mockData.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default HomePage;
