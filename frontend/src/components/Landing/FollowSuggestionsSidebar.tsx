import ProfileBlockSkeleton from "@/components/Skeletons/ProfileBlockSkeleton";
import ProfileBlock from "@/components/Users/ProfileBlock";
import { UserType } from "@/lib/types";
import { GET_USERS } from "@/queries/user";
import { useQuery } from "@apollo/client";
import { Users } from "lucide-react";

interface FollowSuggestionsSidebarProps {
  pageSize: number;
}
const FollowSuggestionsSidebar = ({
  pageSize,
}: FollowSuggestionsSidebarProps) => {
  const { data: usersData, error: usersError } = useQuery<{
    getUsers: UserType[];
  }>(GET_USERS, {
    variables: { page: 1, excludeFollowing: true },
  });

  return (
    <aside className="hidden w-full max-w-80 py-4 lg:flex">
      <div className="flex w-full flex-col items-start gap-1">
        <h1 className="mx-2 text-3xl font-extralight">People to follow</h1>
        {usersError && (
          <p className="mt-4 text-center text-red-500">
            Error loading users: {usersError.message}
          </p>
        )}
        <div className="flex w-full flex-col items-center gap-[0.0625rem] bg-gray-300 dark:bg-gray-700">
          {!usersData?.getUsers
            ? Array.from({ length: pageSize }).map((_, index) => (
                <ProfileBlockSkeleton key={index} />
              ))
            : usersData?.getUsers.map((recommendedUser) => (
                <ProfileBlock user={recommendedUser} key={recommendedUser.id} />
              ))}
        </div>
        <a
          href={`/project2/users`}
          className="mt-4 inline-flex justify-center self-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Users className="mr-2 h-5 w-5" aria-hidden="true" />
          <span>View All Users</span>
        </a>
      </div>
    </aside>
  );
};

export default FollowSuggestionsSidebar;
