import { useAuth } from "@/components/AuthContext";
import {
  FOLLOW_USER_MUTATION,
  GET_USER_QUERY,
  UNFOLLOW_USER_MUTATION,
} from "@/queries/user";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, Check } from "lucide-react";
import { MouseEvent } from "react";

interface FollowButtonProps {
  targetUsername: string;
}

const FollowButton = ({ targetUsername }: FollowButtonProps) => {
  const { user, refetchUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const followingUsernames = user?.following?.map((u) => u.username) ?? [];
    setIsFollowing(followingUsernames.includes(targetUsername));
  }, [user, targetUsername]);

  const [followUserMutation] = useMutation(FOLLOW_USER_MUTATION, {
    variables: { username: targetUsername },
    refetchQueries: [
      { query: GET_USER_QUERY, variables: { username: targetUsername } },
    ],
    onCompleted: () => {
      setIsFollowing(true);
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
      setIsFollowing(false);
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

  return (
    <button
      role="button"
      className="inline-flex cursor-pointer select-none items-center"
      tabIndex={0}
      aria-pressed={isFollowing}
      aria-label={isFollowing ? "Unfollow" : "Follow"}
      onClick={(e) => {
        if (isFollowing) {
          handleUnfollow(e);
        } else {
          handleFollow(e);
        }
      }}
    >
      {isFollowing ? (
        <>
          <Check className="mr-1 h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-500 transition-colors duration-200 hover:text-green-700">
            Following
          </span>
        </>
      ) : (
        <>
          <UserPlus className="mr-1 h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-500 transition-colors duration-200 hover:text-blue-700">
            Follow
          </span>
        </>
      )}
    </button>
  );
};

export default FollowButton;
