import Username from "@/components/Username";
import { formatTimestamp } from "@/lib/dateUtils";
import { NotificationType } from "@/lib/types";
import { DELETE_NOTIFICATION } from "@/queries/notifications";
import { useMutation } from "@apollo/client";
import { TrashIcon } from "lucide-react";
import toast from "react-hot-toast";

interface NotificationCardProps {
  notification: NotificationType;
}
const NotificationCard = ({ notification }: NotificationCardProps) => {
  const [deleteNotification, { loading }] = useMutation(DELETE_NOTIFICATION, {
    variables: { id: notification.id },
    update: (cache) => {
      cache.modify({
        fields: {
          getNotifications(existingNotifications = [], { readField }) {
            return existingNotifications.filter(
              (notificationRef: any) =>
                notification.id !== readField("id", notificationRef),
            );
          },
        },
      });
    },
  });

  const handleDelete = async () => {
    try {
      await deleteNotification();
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error(`Error deleting notification: ${(error as Error).message}`);
    }
  };

  let text: string = "";
  let href: string = "";
  switch (notification.type) {
    case "LIKE":
      if (!notification.postType) {
        text = "Unknown post type";
        break;
      }
      text = `liked your ${notification.postType === "post" ? "post" : "comment"}`;
      href = `/project2/${notification.postType}/${notification.postID}`;
      break;
    case "REPOST":
      if (!notification.postType) {
        text = "Unknown post type";
        break;
      }
      text = `reposted your ${notification.postType === "post" ? "post" : "comment"}`;
      href = `/project2/${notification.postType}/${notification.postID}`;
      break;
    case "COMMENT":
      if (!notification.postType) {
        text = "Unknown post type";
        break;
      }
      text = `commented on your ${notification.postType === "post" ? "post" : "comment"}`;
      href = `/project2/${notification.postType}/${notification.postID}`;
      break;
    case "MENTION":
      if (!notification.postType) {
        text = "Unknown post type";
        break;
      }
      text = `mentioned you in a ${notification.postType === "post" ? "post" : "comment"}`;
      href = `/project2/${notification.postType}/${notification.postID}`;
      break;
    case "FOLLOW":
      text = "followed you";
      href = `/project2/user/${notification.sender.username}`;
      break;
  }

  return (
    <a
      className="flex w-full items-center justify-between gap-4 p-2 text-center text-sm transition-colors dark:hover:bg-gray-800 hover:bg-gray-200 lg:p-3"
      href={href}
    >
      <div className="flex items-center justify-start gap-1 break-words">
        <Username smallAvatar smallBadge user={notification.sender} noHref />
        <p className="">{text}</p>
        <p>·</p>
        <p>{formatTimestamp(notification.createdAt)}</p>
      </div>
      <button disabled={loading}>
        <TrashIcon
          className="size-4 text-gray-600 hover:text-gray-400"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete();
          }}
        />
      </button>
    </a>
  );
};

export default NotificationCard;
