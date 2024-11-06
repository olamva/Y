import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { UserType } from "@/lib/types";
import Avatar from "./Avatar";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: UserType[];
}

const FollowingUsersModal = ({ isOpen, onClose, title, users }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "visible";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="max-h-[80vh] w-full max-w-md overflow-auto rounded-lg bg-white p-6 dark:bg-gray-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {users && (
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="flex items-center space-x-2">
                <a
                  href={`/project2/user/${user.username}`}
                  className="flex items-center space-x-2 hover:scale-110"
                >
                  <Avatar username={user.username} />
                  <span>{user.username}</span>
                </a>
              </li>
            ))}
          </ul>
        )}{" "}
        {users.length === 0 && <p>None</p>}
      </div>
    </div>
  );
};

export default FollowingUsersModal;
