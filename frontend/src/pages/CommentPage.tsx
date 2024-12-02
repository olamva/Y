import { useAuth } from "@/components/AuthContext";
import BackButton from "@/components/BackButton";
import CreatePostField from "@/components/CreatePostField";
import Comment from "@/components/Post/Comment";
import PostWithReply from "@/components/Post/PostWithReply";
import PostSkeleton from "@/components/Skeletons/PostSkeleton";
import Divider from "@/components/ui/Divider";
import { CommentType, PostType } from "@/lib/types";
import {
  CREATE_COMMENT,
  EDIT_COMMENT,
  GET_COMMENT,
  GET_COMMENTS,
} from "@/queries/comments";
import { GET_PARENT } from "@/queries/posts";
import { NetworkStatus, useMutation, useQuery } from "@apollo/client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const COMMENT_PAGE_SIZE = 10;

const CommentPage = () => {
  const { id, edit } = useParams<{
    id: string;
    edit?: string;
  }>();

  const editing = edit === "edit";
  const { user } = useAuth();

  const [editBody, setEditBody] = useState("");
  const [comment, setComment] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const {
    data: postData,
    loading: postLoading,
    error: postError,
    refetch: refetchPost,
  } = useQuery<{ getComment: CommentType }>(GET_COMMENT, {
    variables: { id },
    notifyOnNetworkStatusChange: true,
  });

  const reply = postData?.getComment;

  useEffect(() => {
    if (reply && reply.body)
      document.title = `Y · @${reply.author.username}: ${reply.body}`;
  }, [reply]);

  const {
    data: parentPostData,
    loading: parentPostLoading,
    error: parentPostError,
  } = useQuery<{ getParent: PostType | CommentType }>(GET_PARENT, {
    variables: { parentID: reply?.parentID, parentType: reply?.parentType },
    skip: !reply,
  });

  const parentPost = parentPostData?.getParent;

  useEffect(() => {
    if (!user || !reply || !editing) return;
    if (user.username !== reply?.author.username) {
      window.location.href = `/project2/reply/${id}`;
    }
  }, [user, editing, id, reply]);

  if (!editing && edit) {
    window.location.href = `/project2/reply/${id}`;
  }

  const {
    data: commentsData,
    loading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
    fetchMore: fetchMoreComments,
    networkStatus: commentsNetworkStatus,
  } = useQuery<{ getComments: CommentType[] }>(GET_COMMENTS, {
    variables: { postID: id, page: 1 },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const loadMoreComments = useCallback(async () => {
    if (!hasMore || commentsLoading) return;

    try {
      const { data: fetchMoreData } = await fetchMoreComments({
        variables: { page: page + 1 },
      });

      if (fetchMoreData?.getComments) {
        if (fetchMoreData.getComments.length < COMMENT_PAGE_SIZE) {
          setHasMore(false);
        }
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
    }
  }, [fetchMoreComments, hasMore, commentsLoading, page]);

  useEffect(() => {
    if (reply && !postLoading) {
      setEditBody(reply.body ?? "");
    }
  }, [reply, postLoading]);

  const [createComment, { loading: createLoading, error: createError }] =
    useMutation<
      { createComment: CommentType },
      {
        body: string;
        parentID: string;
        parentType: "post" | "reply";
        file: File | null;
      }
    >(CREATE_COMMENT, {
      onCompleted: () => {
        setComment("");
        setCommentFile(null);
        refetchComments();
        refetchPost();
        toast.success("Comment added successfully!");
      },
      onError: (err) => {
        console.error("Error creating comment:", err);
        toast.error(`Error adding comment: ${err.message}`);
      },
    });

  const [editComment, { loading: editLoading }] = useMutation<
    { editComment: CommentType },
    { id: string; body: string; file: File | null }
  >(EDIT_COMMENT, {
    onCompleted: () => {
      toast.success("Comment edited successfully!");
      window.location.href = `/project2/reply/${id}`;
    },
    onError: (err) => {
      console.error("Error editing post:", err);
      toast.error(`Error editing post: ${err.message}`);
    },
  });

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (comment.trim() === "" && file === null) return;

    try {
      await createComment({
        variables: {
          body: comment.trim(),
          parentID: id!,
          parentType: "reply",
          file: commentFile,
        },
      });
    } catch (error) {
      toast.error(`Error adding comment: ${(error as Error).message}`);
    }
  };

  const handleEditReply = async (e: FormEvent) => {
    e.preventDefault();
    if (editBody.trim() === "" && file === null) {
      toast.error("Reply content cannot be empty.");
      return;
    }

    if (!postData) return;

    if (editBody === reply?.body && !file) {
      toast.error("No changes detected.");
      return;
    }

    try {
      await editComment({
        variables: {
          id: reply?.id || "",
          body: editBody,
          file: file,
        },
      });
    } catch (error) {
      toast.error(`Error editing post: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        commentsNetworkStatus !== NetworkStatus.fetchMore &&
        hasMore
      ) {
        loadMoreComments();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [commentsLoading, page, hasMore, commentsNetworkStatus, loadMoreComments]);

  if (postLoading || parentPostLoading) {
    return (
      <div className="mx-auto my-16 flex w-full max-w-xl flex-col gap-4">
        <PostSkeleton />
        <div className="mx-auto my-4 flex w-full max-w-lg flex-col gap-4">
          <PostSkeleton />
        </div>
      </div>
    );
  }
  if (postError) {
    return <p>Error loading post: {postError.message}</p>;
  }

  if (parentPostError) {
    return <p>Error loading parent post: {parentPostError.message}</p>;
  }

  if (!reply) {
    return <h1>Reply not found</h1>;
  }

  return (
    <div className="w-full">
      <BackButton />
      <main className="flex flex-col items-center px-4 pt-5">
        {editing ? (
          <form
            className="flex w-full max-w-xl flex-col items-start gap-4"
            onSubmit={handleEditReply}
          >
            <CreatePostField
              placeholder="What else is on your mind?"
              value={editBody}
              setValue={setEditBody}
              loading={editLoading}
              file={file}
              setFile={setFile}
              existingImageURL={
                reply.imageUrl ? `${BACKEND_URL}${reply.imageUrl}` : undefined
              }
              enabled={
                (editBody !== reply.body || file !== null) && user !== null
              }
            />
          </form>
        ) : (
          <PostWithReply
            goHomeOnParentDelete
            replyDoesntRedirect
            expandedReply
            post={parentPost}
            reply={reply}
          />
        )}
        <Divider />
        {!editing && (
          <form
            className="flex w-full max-w-xl flex-col items-center gap-2"
            onSubmit={handleAddComment}
          >
            <CreatePostField
              placeholder="Write your reply..."
              value={comment}
              setValue={setComment}
              loading={createLoading}
              file={commentFile}
              setFile={setCommentFile}
              enabled={
                (comment.trim() !== "" || file !== null) && user !== null
              }
            />
          </form>
        )}
        {createError && (
          <p className="text-red-500">
            Error adding comment: {createError.message}
          </p>
        )}

        {commentsData?.getComments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}

        {commentsError && (
          <p>Error loading comments: {commentsError.message}</p>
        )}

        {commentsLoading ||
          (commentsNetworkStatus === NetworkStatus.loading && (
            <p>Loading comments...</p>
          ))}

        {!hasMore && commentsData?.getComments.length !== 0 && (
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            You've reached the end of the comments.
          </p>
        )}

        {!commentsLoading && commentsData?.getComments.length === 0 && (
          <p className="mt-4">No comments available.</p>
        )}
      </main>
    </div>
  );
};

export default CommentPage;
