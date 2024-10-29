import HomePage from "@/App.tsx";
import "@/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar.tsx";
// import Profile from "@/pages/Profile.tsx";
import SearchPage from "@/pages/Search.tsx";
import PostPage from "@/pages/PostPage.tsx";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const router = createBrowserRouter([
  {
    path: "/project2",
    element: <HomePage />,
  },
  // {
  //   path: "/project2/user/:username",
  //   element: <Profile />,
  // },
  {
    path: "/project2/search/",
    element: <SearchPage />,
  },
  {
    path: "/project2/post/:id",
    element: <PostPage />,
  },
]);

const client = new ApolloClient({
  uri: "http://localhost:3001/graphql",
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <div className="min-h-screen">
        <Navbar />
        <RouterProvider router={router} />
      </div>
    </ApolloProvider>
  </StrictMode>,
);
