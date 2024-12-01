import { useAuth } from "@/components/AuthContext";
import NotificationCard from "@/components/Navbar/Notifications/NotificationCard";
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
import { NetworkStatus, useMutation, useQuery } from "@apollo/client";
import { BellIcon } from "@heroicons/react/24/outline";
import { CheckCheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const NOTIFICATIONS_PER_PAGE = 16;

const Notifications = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const { data, loading, fetchMore, networkStatus } = useQuery<{
    getNotifications: NotificationType[];
  }>(GET_NOTIFICATIONS, {
    variables: { page: 1, limit: NOTIFICATIONS_PER_PAGE },
    skip: !user,
    notifyOnNetworkStatusChange: true,
  });

  const notifications = data?.getNotifications;

  const [deleteAllNotifications, { loading: deleteLoading }] = useMutation(
    DELETE_ALL_NOTIFICATIONS,
    {
      update: (cache) => {
        cache.modify({
          fields: {
            getNotifications() {
              return [];
            },
          },
        });
      },
    },
  );

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      // Manually update the cache
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(`Error deleting notifications: ${(error as Error).message}`);
    }
  };

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

  useEffect(() => {
    if (notifications?.length === 0) setShowNotifications(false);
  }, [notifications]);

  useEffect(() => {
    if (showNotifications) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showNotifications]);

  const loadMoreNotifications = async () => {
    if (!hasMore || loading || networkStatus === NetworkStatus.fetchMore)
      return;
    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: page + 1, limit: NOTIFICATIONS_PER_PAGE },
      });

      if (fetchMoreData?.getNotifications) {
        if (fetchMoreData.getNotifications.length < NOTIFICATIONS_PER_PAGE) {
          setHasMore(false);
        }
        if (fetchMoreData.getNotifications.length > 0) {
          setPage((prev) => prev + 1);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
    }
  };

  const handleScroll = async () => {
    if (
      scrollableDivRef.current &&
      scrollableDivRef.current.scrollTop +
        scrollableDivRef.current.clientHeight >=
        scrollableDivRef.current.scrollHeight - 120
    ) {
      await loadMoreNotifications();
    }
  };

  return (
    <div className="flex items-center justify-center lg:mx-2">
      <Popover open={showNotifications}>
        <PopoverTrigger asChild>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative"
            aria-label="Notifications"
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
        <PopoverContent ref={popoverRef} className="z-[70] w-fit p-0">
          {notifications && notifications.length > 2 && (
            <div className="flex justify-between border-b border-gray-200 p-2 dark:border-gray-700 lg:p-3">
              <p className="text-sm font-extrabold">Mark all as read?</p>
              <button
                disabled={deleteLoading}
                className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                <CheckCheckIcon
                  className="size-4 text-gray-600 dark:text-gray-400"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteAll();
                  }}
                />
              </button>
            </div>
          )}
          <div
            className="max-h-60 w-fit overflow-auto"
            ref={scrollableDivRef}
            onScroll={handleScroll}
          >
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
      </Popover>
    </div>
  );
};

export default Notifications;
