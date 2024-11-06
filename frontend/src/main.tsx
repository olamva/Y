import HomePage from "@/App.tsx";
import { AuthProvider } from "@/components/AuthContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar/Navbar.tsx";
import "@/globals.css";
import { client } from "@/lib/apolloClient";
import PostPage from "@/pages/PostPage.tsx";
import Profile from "@/pages/Profile";
import SearchPage from "@/pages/Search.tsx";
import { ApolloProvider } from "@apollo/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginForm from "./components/LoginForm";

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
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <Toaster />
        <div className="flex min-h-svh flex-col bg-gray-100 dark:bg-gray-800">
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
