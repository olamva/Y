import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Avatar from "@/components/Users/Avatar";
import ProfilePreview from "@/components/Users/ProfilePreview";
import VerificationBadge from "@/components/Users/VerificationBadge";
import { UserType } from "@/lib/types";
import { MouseEvent, TouchEvent } from "react";

interface UsernameProps {
  user: UserType;
  noHref?: boolean;
  noAvatar?: boolean;
  noPreview?: boolean;
  customBadgeColors?: string;
  smallBadge?: boolean;
  smallAvatar?: boolean;
  hideFullName?: boolean;
  vertical?: boolean;
  verticalWhenSmall?: boolean;
}
const Username = ({
  user,
  noHref,
  noAvatar,
  noPreview,
  customBadgeColors,
  smallBadge,
  smallAvatar,
  hideFullName,
  vertical,
  verticalWhenSmall,
}: UsernameProps) => {
  const Tag = noHref ? "div" : "a";
  const tagProps = noHref
    ? {}
    : {
        href: `/project2/user/${user.username}`,
        onClick: (e: MouseEvent | TouchEvent) => e.stopPropagation(),
      };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Tag
            className={`group flex items-center ${smallAvatar ? "gap-1" : "gap-2"}`}
            {...tagProps}
          >
            {!noAvatar && (
              <Avatar
                small={smallAvatar}
                disableHover
                user={user}
                noHref
                large={false}
              />
            )}
            <div className="flex items-center gap-1">
              {!hideFullName && user.firstName ? (
                <div
                  className={`flex ${vertical ? "flex-col items-start" : verticalWhenSmall ? "flex-col items-start sm:flex-row sm:items-center sm:gap-1" : "items-center gap-1"}`}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block break-words ${noHref ? "" : "underline-offset-2 group-hover:underline"}`}
                    >
                      {user.firstName}{" "}
                      {user.lastName &&
                      user.firstName.length + user.lastName.length <= 20
                        ? user.lastName
                        : ""}
                    </span>
                    <VerificationBadge
                      customColors={customBadgeColors}
                      verified={user.verified}
                      small={smallBadge}
                    />
                  </div>
                  <p
                    className={`break-words font-mono ${vertical ? "text-xs" : verticalWhenSmall ? "text-xs sm:text-sm" : "text-sm"} text-gray-600 dark:text-gray-300`}
                  >
                    <span className="font-sans">@</span>
                    {user.username}
                  </p>
                </div>
              ) : (
                <>
                  <p
                    className={`break-words font-mono text-sm ${noHref ? "" : "underline-offset-4 group-hover:underline"}`}
                  >
                    <span className="font-sans">@</span>
                    {user.username}
                  </p>
                  <VerificationBadge
                    customColors={customBadgeColors}
                    verified={user.verified}
                    small={smallBadge}
                  />
                </>
              )}
            </div>
          </Tag>
        </TooltipTrigger>
        <TooltipContent className="border border-gray-300 p-0 dark:border-gray-600">
          {!noPreview && <ProfilePreview user={user} />}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Username;
