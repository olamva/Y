import { useEffect } from "react";
import { Link } from "react-router-dom";

interface NotFoundProps {
  page?: string;
}

const NotFound = ({ page }: NotFoundProps) => {
  useEffect(() => {
    document.title = "Y";
  }, []);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center px-5 text-center">
      <h1 className="text-4xl font-bold">UwU 404</h1>
      <h2>We couldn't find your {page ? page : "page"}</h2>
      <h3>Pweease go back home</h3>
      <img
        src="/project2/cute_cat_404.gif"
        alt="Cute cat screaming at its computer:("
      />
      <Link
        className="my-4 rounded-lg bg-pink-600 px-4 py-2 text-white hover:opacity-80"
        to="/project2"
      >
        Go back home
      </Link>
    </main>
  );
};

export default NotFound;
