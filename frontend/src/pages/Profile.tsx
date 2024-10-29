import Avatar from "@/components/Avatar";
import Post from "@/components/Post";
import Comment from "@/components/Comment";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { Button } from "@/components/ui/button";
import { CommentType, PostType, UserType } from "@/lib/types";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_USER_QUERY } from "@/queries/user";
import { GET_POSTS_BY_IDS } from "@/queries/posts";
import { GET_COMMENTS_BY_IDS } from "@/queries/comments";

type ViewState = "posts" | "likes" | "comments";

interface Props {
  username?: string;
}

const Profile = ({ username }: Props) => {
  const { username: paramUsername } = useParams<{ username: string }>();
  if (!username) {
    username = paramUsername;
  }
  const [currentView, setCurrentView] = useState<ViewState>("posts");

  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER_QUERY, {
    variables: { username },
    skip: !username,
  });

  const user: UserType | undefined = userData?.getUser;

  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: user?.postIds || [] },
    skip: !user || !user.postIds.length,
  });

  const posts: PostType[] = postsData?.getPostsByIds || [];

  const {
    data: likedPostsData,
    loading: likedPostsLoading,
    error: likedPostsError,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: user?.likedPostIds || [] },
    skip: !user || !user.likedPostIds.length,
  });

  const likedPosts: PostType[] = likedPostsData?.getPostsByIds || [];

  const {
    data: commentsData,
    loading: commentsLoading,
    error: commentsError,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: user?.commentIds || [] },
    skip: !user || !user.commentIds.length,
  });

  const comments: CommentType[] = commentsData?.getCommentsByIds || [];

  if (userLoading) return <p>Loading user...</p>;
  if (userError) return <p>Error loading user: {userError.message}</p>;

  return (
    <div>
      <header>
        <Button
          className="m-2 flex gap-2 text-xl"
          onClick={() => window.history.back()}
          variant="ghost"
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
          <p>Back</p>
        </Button>
      </header>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Avatar username={user?.username || "unknown"} />
          <h1 className="font-mono">{user?.username || "Unknown User"}</h1>
        </div>
      </div>
      <section>
        <ToggleGroup
          value={currentView}
          onValueChange={(value: ViewState) => {
            if (value) setCurrentView(value);
          }}
          type="single"
          variant="outline"
          className="flex justify-around gap-1"
        >
          <ToggleGroupItem value="posts" aria-label="View Posts">
            <p>Posts</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="likes" aria-label="View Likes">
            <p>Likes</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="comments" aria-label="View Comments">
            <p>Comments</p>
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="mt-2 flex w-full flex-col items-center">
          {currentView === "posts" && (
            <>
              {postsLoading && <p>Loading posts...</p>}
              {postsError && <p>Error loading posts: {postsError.message}</p>}
              {posts.map((post) => (
                <Post post={post} key={post.id} />
              ))}
              {!postsLoading && posts.length === 0 && (
                <p>No posts to display.</p>
              )}
            </>
          )}
          {currentView === "likes" && (
            <>
              {likedPostsLoading && <p>Loading liked posts...</p>}
              {likedPostsError && (
                <p>Error loading liked posts: {likedPostsError.message}</p>
              )}
              {likedPosts.map((post) => (
                <Post post={post} key={post.id} />
              ))}
              {!likedPostsLoading && likedPosts.length === 0 && (
                <p>No liked posts to display.</p>
              )}
            </>
          )}
          {currentView === "comments" && (
            <>
              {commentsLoading && <p>Loading comments...</p>}
              {commentsError && (
                <p>Error loading comments: {commentsError.message}</p>
              )}
              {comments.map((comment) => (
                <Comment comment={comment} key={comment.id} />
              ))}
              {!commentsLoading && comments.length === 0 && (
                <p>No comments to display.</p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
