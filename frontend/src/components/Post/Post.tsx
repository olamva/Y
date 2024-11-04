import { useAuth } from "@/components/AuthContext";
import PostContent from "@/components/Post/PostContent";
import { PostType } from "@/lib/types";
import { DELETE_POST, LIKE_POST, UNLIKE_POST } from "@/queries/posts";
import { FOLLOW_USER_MUTATION, UNFOLLOW_USER_MUTATION } from "@/queries/user";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface PostProps {
  post: PostType;
  doesntRedirect?: boolean;
  disableTopMargin?: boolean;
  disableBottomMargin?: boolean;
}

const Post = ({
  post,
  doesntRedirect,
  disableBottomMargin = false,
  disableTopMargin = false,
}: PostProps) => {
  const { user, refetchUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [amtLikes, setAmtLikes] = useState(post.amtLikes);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    setIsLiked(user?.likedPostIds.includes(post.id) ?? false);

    const followingUsernames = user?.following?.map((u) => u.username) ?? [];
    setIsFollowing(followingUsernames.includes(post.author));
  }, [user, post.id, post.author]);

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

  const [followUserMutation] = useMutation(FOLLOW_USER_MUTATION, {
    variables: { username: post.author },
    onCompleted: () => {
      setIsFollowing(true);
      toast.success(`You are now following ${post.author}`);
      refetchUser();
    },
    onError: (error) => {
      toast.error(`Error following user: ${error.message}`);
    },
  });

  const [unfollowUserMutation] = useMutation(UNFOLLOW_USER_MUTATION, {
    variables: { username: post.author },
    onCompleted: () => {
      setIsFollowing(false);
      toast.success(`You have unfollowed ${post.author}`);
      refetchUser();
    },
    onError: (error) => {
      toast.error(`Error unfollowing user: ${error.message}`);
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

  const followUser = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    try {
      await followUserMutation();
    } catch (error) {
      toast.error(`Error following user: ${(error as Error).message}`);
    }
  };

  const unfollowUser = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    try {
      await unfollowUserMutation();
    } catch (error) {
      toast.error(`Error unfollowing user: ${(error as Error).message}`);
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
      className="border-white bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
      disableTopMargin={disableTopMargin}
      disableBottomMargin={disableBottomMargin}
      followUser={followUser}
      unfollowUser={unfollowUser}
      isFollowing={isFollowing}
    />
  );
};

export default Post;
