import { useAuth } from "@/components/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationType } from "@/lib/types";
import {
  DELETE_ALL_NOTIFICATIONS,
  GET_NOTIFICATIONS,
} from "@/queries/notifications";
import { useMutation, useQuery } from "@apollo/client";
import { BellIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import NotificationCard from "./NotificationCard";

const Notifications = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data, loading } = useQuery<{ getNotifications: NotificationType[] }>(
    GET_NOTIFICATIONS,
    { skip: !user },
  );

  const [deleteAllNotifications, { loading: deleteLoading }] = useMutation(
    DELETE_ALL_NOTIFICATIONS,
    {
      update: (cache) => {
        cache.writeQuery({
          query: GET_NOTIFICATIONS,
          data: { getNotifications: [] },
        });
      },
    },
  );

  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to mark all notifications as read?",
    );
    if (!confirmDelete) return;

    try {
      await deleteAllNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(`Error deleting notifications: ${(error as Error).message}`);
    }
  };

  const notifications = data?.getNotifications;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-center lg:mx-2">
      <Popover open={showNotifications}>
        <PopoverTrigger asChild>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative"
            ref={buttonRef}
          >
            <BellIcon className="size-6 text-gray-600 dark:text-gray-300" />
            {notifications && notifications.length > 0 && (
              <span className="absolute right-0 top-0 flex size-3 items-center justify-center rounded-full bg-red-500">
                <span className="size-1 rounded-full bg-white"></span>
              </span>
            )}
          </button>
        </PopoverTrigger>
        {!loading && (
          <PopoverContent ref={popoverRef} className="z-[70] w-fit p-0">
            {notifications && notifications?.length > 2 && (
              <div className="flex justify-between border-b border-gray-200 p-2 lg:p-3">
                <p className="text-sm font-light">Mark all as read?</p>
                <button disabled={deleteLoading}>
                  <TrashIcon
                    className="size-4 text-gray-600 hover:text-gray-400"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteAll();
                    }}
                  />
                </button>
              </div>
            )}
            <div className="max-h-60 w-fit overflow-auto">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))
              ) : (
                <div className="p-4 text-center">
                  <p>You have no new notifications 🤖</p>
                </div>
              )}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};

export default Notifications;
