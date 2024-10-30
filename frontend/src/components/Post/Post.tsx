import { PostType } from "@/lib/types";
import { DELETE_POST, LIKE_POST, UNLIKE_POST } from "@/queries/posts";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../AuthContext";
import PostContent from "./PostContent";

interface PostProps {
  post: PostType;
  doesntRedirect?: boolean;
}
const Post = ({ post, doesntRedirect }: PostProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [amtLikes, setAmtLikes] = useState(post.amtLikes);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    setIsLiked(user?.likedPostIds.includes(post.id) ?? false);
  }, [user?.likedPostIds, post.id]);

  const [likePost] = useMutation(LIKE_POST, {
    variables: { postID: post.id },
    onCompleted: (data) => {
      setAmtLikes(data.likePost.amtLikes);
      setIsLiked(true);
    },
    onError: (error) => {
      toast.error(`Error liking post: ${error.message}`);
    },
  });

  const [unlikePost] = useMutation(UNLIKE_POST, {
    variables: { postID: post.id },
    onCompleted: (data) => {
      setAmtLikes(data.unlikePost.amtLikes);
      setIsLiked(false);
    },
    onError: (error) => {
      toast.error(`Error unliking post: ${error.message}`);
    },
  });

  const [deletePostMutation, { loading: deleteLoading, error: deleteError }] =
    useMutation(DELETE_POST, {
      variables: { id: post.id },
      update: (cache, { data }) => {
        if (!data) return;
        const deletedPostId = data.deletePost.id;
        cache.modify({
          fields: {
            getPosts(existingPosts = []) {
              return existingPosts.filter(
                (postRef: { __ref: string }) =>
                  postRef.__ref !== `Post:${deletedPostId}`,
              );
            },
          },
        });
      },
      onCompleted: () => {
        setIsDeleted(true);
        toast.success("Post deleted successfully");
      },
      onError: (err) => {
        toast.error(`Error deleting post: ${err.message}`);
      },
    });

  const toggleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (isLiked) {
      unlikePost();
    } else {
      likePost();
    }
  };

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );
    if (!confirmDelete) return;

    try {
      await deletePostMutation();
    } catch (error) {
      toast.error(`Error deleting post: ${(error as Error).message}`);
    }
  };

  if (isDeleted) return null;

  return (
    <PostContent
      post={post}
      handleDelete={handleDelete}
      toggleLike={toggleLike}
      isLiked={isLiked}
      amtLikes={amtLikes}
      deleteLoading={deleteLoading}
      deleteError={deleteError}
      doesntRedirect={doesntRedirect}
    />
  );
};

export default Post;
