import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "@/App.tsx";
import "@/index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar.tsx";
import SearchPage from "./pages/Search.tsx";
import PostPage from "./pages/PostPage.tsx";

const router = createBrowserRouter([
  {
    path: "/project2",
    element: <HomePage />,
  },
  {
    path: "/project2/search/",
    element: <SearchPage />,
  },
  {
    path: "/project2/post/:id",
    element: <PostPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Navbar />
    <div className="min-h-screen">
      <RouterProvider router={router} />
    </div>
  </StrictMode>,
);
