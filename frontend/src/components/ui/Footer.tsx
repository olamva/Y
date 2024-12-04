const Footer = () => (
  <footer className="border-t border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-950">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-end sm:flex-row">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          &copy; {new Date().getFullYear()} Y Corporation. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
