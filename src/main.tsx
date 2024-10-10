import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "@/App.tsx";
import "@/index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar.tsx";
import { Userpage } from "./components/Userpage/userpage.tsx";

const router = createBrowserRouter([
  {
    path: "/project2",
    element: <HomePage />,
  },
  {
    path: "/project2/user/:id",
    element: <Userpage />,
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Navbar />
    <div className="min-h-screen">
      <RouterProvider router={router} />
    </div>
  </StrictMode>
);
