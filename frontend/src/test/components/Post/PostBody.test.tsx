import PostBody from "@/components/Post/PostBody";
import { GET_USER_QUERY } from "@/queries/user";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

describe("PostBody", () => {
  it("renders text and collapses/expands correctly", async () => {
    const text =
      "This is a post with a #hashtag and a @mention and a link to https://example.com orem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vehicula, sapien a vehicula tincidunt, velit orem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vehicula ";

    const mocks = [
      {
        request: {
          query: GET_USER_QUERY,
          variables: { username: "mention" },
        },
        result: {
          data: {
            getUser: {
              id: "123",
              username: "mention",
              name: "Test User",
              profilePicture: "https://example.com/profile.jpg",
            },
          },
        },
      },
    ];

    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <PostBody expanded={false} text={text} />
        </MockedProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Read more...")).toBeInTheDocument();
    expect(screen.queryByText("Hide")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Read more..."));

    expect(await screen.findByText("Hide")).toBeInTheDocument();

    expect(screen.getByText("#hashtag")).toHaveAttribute(
      "href",
      "/project2/hashtag/hashtag",
    );
    expect(screen.getByText("@mention")).toHaveAttribute(
      "href",
      "/project2/user/mention",
    );
    expect(screen.getByText("https://example.com")).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });
});
