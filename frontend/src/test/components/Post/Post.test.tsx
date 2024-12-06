import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Post from "@/components/Post/Post";
import { PostType, VerifiedTiers } from "@/lib/types";
import { MockedProvider } from "@apollo/client/testing";
import toast from "react-hot-toast";

vi.mock("@/hooks/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { likedPostIds: ["2"], username: "testuser" },
  }),
}));

vi.mock("react-hot-toast");

describe("Post", () => {
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

  it("renders the post correctly", () => {
    render(
      <MockedProvider>
        <Post post={mockPost} />
      </MockedProvider>,
    );

    expect(screen.getByText("This is a test post")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Likes count
    expect(screen.getByText("3")).toBeInTheDocument(); // Comments count
    expect(screen.getByText("2")).toBeInTheDocument(); // Reposts count
  });

  it("handles like and unlike post functionality", async () => {
    render(
      <MockedProvider>
        <Post post={mockPost} />
      </MockedProvider>,
    );

    const likeButton = screen.getByLabelText("Like post");

    // Simulate liking the post
    await userEvent.click(likeButton);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Post liked successfully"),
    );

    // Simulate unliking the post
    await userEvent.click(likeButton);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Post unliked successfully"),
    );
  });

  it("handles delete post functionality", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MockedProvider>
        <Post post={mockPost} />
      </MockedProvider>,
    );

    const deleteButton = screen.getByLabelText("Delete post");

    // Simulate deleting the post
    await userEvent.click(deleteButton);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Post deleted successfully");
    });
  });

  it("displays an error when delete fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MockedProvider>
        <Post
          post={mockPost}
          goHomeOnDelete={false}
          disableBottomMargin
          expanded
        />
      </MockedProvider>,
    );

    const deleteButton = screen.getByLabelText("Delete post");

    // Simulate deleting the post
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Error deleting post"),
      );
    });
  });
});
