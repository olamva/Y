import HomePage from "@/App.tsx";
import { AuthProvider } from "@/components/AuthContext";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";
import Navbar from "@/components/Navbar/Navbar.tsx";
import "@/globals.css";
import client from "@/lib/apolloClient";
import CommentPage from "@/pages/CommentPage";
import PostPage from "@/pages/PostPage.tsx";
import Profile from "@/pages/Profile";
import SearchPage from "@/pages/Search.tsx";
import { ApolloProvider } from "@apollo/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HashtagPage from "./pages/HashtagPage";
import HashtagsPage from "./pages/HashtagsPage";
import UsersPage from "./pages/UsersPage";

const router = createBrowserRouter([
  {
    path: "/project2",
    element: <HomePage />,
  },
  {
    path: "/project2/login",
    element: <LoginForm view="login" />,
  },
  {
    path: "/project2/register",
    element: <LoginForm view="register" />,
  },
  {
    path: "project2/users",
    element: <UsersPage />,
  },
  {
    path: "/project2/user",
    element: <Profile />,
  },

  {
    path: "/project2/user/:username",
    element: <Profile />,
  },
  {
    path: "/project2/user/:username/:view",
    element: <Profile />,
  },
  {
    path: "/project2/search/",
    element: <SearchPage />,
  },
  {
    path: "/project2/post/:id/:edit?",
    element: <PostPage />,
  },
  {
    path: "/project2/reply/:id/:edit?",
    element: <CommentPage />,
  },
  {
    path: "/project2/hashtag/",
    element: <HashtagsPage />,
  },
  {
    path: "/project2/hashtag/:hashtag",
    element: <HashtagPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <Toaster />
        <div className="flex min-h-svh min-w-fit flex-col bg-gray-100 dark:bg-gray-800">
          <Navbar />
          <div className="mb-4 flex flex-grow items-start">
            <RouterProvider router={router} />
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
);
