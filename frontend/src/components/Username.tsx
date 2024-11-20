import Avatar from "@/components/Profile/Avatar";
import { UserType } from "@/lib/types";
import { MouseEvent, TouchEvent } from "react";
import VerificationBadge from "./VerificationBadge";

interface UsernameProps {
  user: UserType;
  noHref?: boolean;
  noAvatar?: boolean;
  customBadgeColors?: string;
  className?: string;
  smallBadge?: boolean;
}
const Username = ({
  user,
  noHref,
  noAvatar,
  customBadgeColors,
  className,
  smallBadge,
}: UsernameProps) => {
  const Tag = noHref ? "div" : "a";
  const tagProps = noHref
    ? {}
    : {
        href: `/project2/user/${user.username}`,
        onClick: (e: MouseEvent | TouchEvent) => e.stopPropagation(),
      };
  return (
    <Tag className="flex items-center gap-2" {...tagProps}>
      {!noAvatar && <Avatar user={user} noHref large={false} />}
      <div className="flex items-center gap-1">
        <p
          className={`break-words font-mono ${noHref ? "" : "underline-offset-4 hover:underline"} ${className}`}
        >
          <span className="font-sans">@</span>
          {user.username}
        </p>
        <VerificationBadge
          customColors={customBadgeColors}
          verified={user.verified}
          small={smallBadge}
        />
      </div>
    </Tag>
  );
};

export default Username;
