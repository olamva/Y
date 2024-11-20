import { useAuth } from "@/components/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationType } from "@/lib/types";
import { GET_NOTIFICATIONS } from "@/queries/notifications";
import { useQuery } from "@apollo/client";
import { BellIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
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
      {!loading && notifications && (
        <PopoverContent ref={popoverRef} className="z-[70] p-0 w-fit">
          {notifications.length > 0 ? (
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
        </PopoverContent>
      )}
    </Popover>
  );
};

export default Notifications;
