const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-200/80 dark:border-gray-700 dark:bg-gray-950/80">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <div className="mb-4 flex items-center sm:mb-0">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Y
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            &copy; {new Date().getFullYear()} Y Corporation. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
