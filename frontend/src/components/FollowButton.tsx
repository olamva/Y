import { useAuth } from "@/components/AuthContext";
import {
  FOLLOW_USER_MUTATION,
  GET_USER_QUERY,
  UNFOLLOW_USER_MUTATION,
} from "@/queries/user";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { MouseEvent } from "react";

interface FollowButtonProps {
  targetUsername: string;
  className: string;
}

const FollowButton = ({ targetUsername, className }: FollowButtonProps) => {
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
      className="hover:scale-110"
      onClick={(e) => {
        if (isFollowing) {
          handleUnfollow(e);
        } else {
          handleFollow(e);
        }
      }}
    >
      {isFollowing ? (
        <MinusCircleIcon className={className} />
      ) : (
        <PlusCircleIcon className={className} />
      )}
    </button>
  );
};

export default FollowButton;
