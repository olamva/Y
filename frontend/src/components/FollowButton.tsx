import { useAuth } from "@/components/AuthContext";
import {
  FOLLOW_USER_MUTATION,
  GET_USER_QUERY,
  UNFOLLOW_USER_MUTATION,
} from "@/queries/user";
import { useMutation } from "@apollo/client";
import { Check, UserPlus, X } from "lucide-react";
import { MouseEvent, useState } from "react";
import toast from "react-hot-toast";

interface FollowButtonProps {
  targetUsername: string;
}

const FollowButton = ({ targetUsername }: FollowButtonProps) => {
  const { user, refetchUser, following, setFollowing } = useAuth();
  const [isHovering, setIsHovering] = useState(false);

  const [followUserMutation] = useMutation(FOLLOW_USER_MUTATION, {
    variables: { username: targetUsername },
    refetchQueries: [
      { query: GET_USER_QUERY, variables: { username: targetUsername } },
    ],
    onCompleted: () => {
      setFollowing([...following, targetUsername]);
      toast.success(`You are now following ${targetUsername}`);
      refetchUser();
    },
    onError: (error) => {
      toast.error(`Error following user: ${(error as Error).message}`);
    },
  });

  const [unfollowUserMutation] = useMutation(UNFOLLOW_USER_MUTATION, {
    variables: { username: targetUsername },
    refetchQueries: [
      { query: GET_USER_QUERY, variables: { username: targetUsername } },
    ],
    onCompleted: () => {
      setFollowing(following.filter((u) => u !== targetUsername));
      toast.success(`You have unfollowed ${targetUsername}`);
      refetchUser();
    },
    onError: (error) => {
      toast.error(`Error unfollowing user: ${(error as Error).message}`);
    },
  });

  const handleFollow = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      await followUserMutation();
    } catch (error) {
      toast.error(`Error following user: ${(error as Error).message}`);
    }
  };

  const handleUnfollow = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      await unfollowUserMutation();
    } catch (error) {
      toast.error(`Error unfollowing user: ${(error as Error).message}`);
    }
  };

  const isFollowing = following.includes(targetUsername);

  const displayButton = user ? user.username !== targetUsername : true;

  return (
    displayButton && (
      <button
        role="button"
        className="inline-flex cursor-pointer select-none items-center"
        tabIndex={0}
        aria-pressed={isFollowing}
        aria-label={
          isFollowing ? (isHovering ? "Unfollow" : "Following") : "Follow"
        }
        onClick={(e) => {
          if (isFollowing) {
            handleUnfollow(e);
          } else {
            handleFollow(e);
            setIsHovering(false);
          }
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {!isFollowing ? (
          <>
            <UserPlus className="mr-1 h-4 w-4 text-blue-500" />
            <span className="hidden text-sm font-medium text-blue-500 transition-colors duration-200 hover:text-blue-700 sm:flex">
              Follow
            </span>
          </>
        ) : isHovering ? (
          <>
            <X className="mr-1 h-4 w-4 text-red-500" />
            <span className="hidden text-sm font-medium text-red-500 transition-colors duration-200 hover:text-red-700 sm:flex">
              Unfollow
            </span>
          </>
        ) : (
          <>
            <Check className="mr-1 h-4 w-4 text-green-500" />
            <span className="hidden text-sm font-medium text-green-500 transition-colors duration-200 hover:text-green-700 sm:flex">
              Following
            </span>
          </>
        )}
      </button>
    )
  );
};

export default FollowButton;
