import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import PostContent from "@/components/Post/PostContent";
import { PostType, VerifiedTiers } from "@/lib/types";
import { MockedProvider } from "@apollo/client/testing";

vi.mock("@/components/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { username: "testuser", repostedPostIds: [] },
  }),
}));

describe("PostContent", () => {
  const mockPost: PostType = {
    id: "1",
    body: "This is a test post",
    originalBody: undefined,
    author: {
      __typename: "User",
      id: "123",
      username: "testuser",
      postIds: [],
      likedPostIds: [],
      mentionedPostIds: [],
      repostedPostIds: [],
      commentIds: [],
      likedCommentIds: [],
      mentionedCommentIds: [],
      followers: [],
      following: [],
      profilePicture: undefined,
      backgroundPicture: undefined,
      verified: VerifiedTiers.UNVERIFIED,
    },
    amtLikes: 5,
    amtComments: 3,
    amtReposts: 2,
    imageUrl: undefined,
    createdAt: "2023-11-20T12:34:56Z",
    __typename: "Post",
  };

  const mockToggleLike = vi.fn();
  const mockHandleDelete = vi.fn().mockResolvedValueOnce(undefined);

  it("renders the post content correctly", () => {
    render(
      <MockedProvider>
        <PostContent
          post={mockPost}
          toggleLike={mockToggleLike}
          isLiked={false}
          amtLikes={mockPost.amtLikes}
          handleDelete={mockHandleDelete}
          deleteLoading={false}
          deleteError={undefined}
          disableTopMargin={false}
          disableBottomMargin={false}
        />
      </MockedProvider>,
    );

    expect(screen.getByText("This is a test post")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls toggleLike function when like button is clicked", async () => {
    render(
      <MockedProvider>
        <PostContent
          post={mockPost}
          toggleLike={mockToggleLike}
          isLiked={false}
          amtLikes={mockPost.amtLikes}
          handleDelete={mockHandleDelete}
          deleteLoading={false}
          deleteError={undefined}
          disableTopMargin={false}
          disableBottomMargin={false}
        />
      </MockedProvider>,
    );

    const likeButton = screen.getByLabelText("Like post");
    await userEvent.click(likeButton);

    expect(mockToggleLike).toHaveBeenCalledTimes(1);
  });

  it("calls handleDelete function when delete button is clicked", async () => {
    render(
      <MockedProvider>
        <PostContent
          post={mockPost}
          toggleLike={mockToggleLike}
          isLiked={false}
          amtLikes={mockPost.amtLikes}
          handleDelete={mockHandleDelete}
          deleteLoading={false}
          deleteError={undefined}
          disableTopMargin={false}
          disableBottomMargin={false}
        />
      </MockedProvider>,
    );

    const deleteButton = screen.getByLabelText("Delete post");
    await userEvent.click(deleteButton);

    expect(mockHandleDelete).toHaveBeenCalledTimes(1);
  });

  it("displays error message when deleteError is present", () => {
    render(
      <MockedProvider>
        <PostContent
          post={mockPost}
          toggleLike={mockToggleLike}
          isLiked={false}
          amtLikes={mockPost.amtLikes}
          handleDelete={mockHandleDelete}
          deleteLoading={false}
          deleteError={{ message: "Failed to delete post" } as any}
          disableTopMargin={false}
          disableBottomMargin={false}
        />
      </MockedProvider>,
    );

    expect(
      screen.getByText("Error deleting post: Failed to delete post"),
    ).toBeInTheDocument();
  });
});
