import Post from "@/components/Post";
import { useParams } from "react-router-dom";
import { mockData } from "@/lib/mockupData";
import { PostType } from "@/lib/types";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();

  const post: PostType | undefined = mockData.find((post) => id === post.id);

  if (!post) {
    return <h1>Post not found</h1>;
  }

  return (
    <main className="flex flex-col items-center">
      <Post post={post} />
    </main>
  );
};

export default PostPage;
