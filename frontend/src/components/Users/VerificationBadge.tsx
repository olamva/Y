import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VerifiedTiers } from "@/lib/types";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const VerificationBadge = ({
  verified,
  customColors,
  small = false,
}: {
  verified: VerifiedTiers;
  customColors?: string;
  small?: boolean;
}) => {
  let colorsTouse: string = "";
  let verifiedText: string = "";
  switch (verified) {
    case VerifiedTiers.VERIFIED:
      colorsTouse =
        customColors ||
        "text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-500";
      verifiedText = "This user has been verified as a trusted user.";
      break;
    case VerifiedTiers.MADS:
      colorsTouse =
        "text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-500";
      verifiedText = "Stay away from this user.";
      break;
    case VerifiedTiers.DEVELOPER:
      colorsTouse =
        "text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-500";
      verifiedText =
        "This user has been verified as one of the developers of this site.";
      break;
  }

  return (
    verified !== VerifiedTiers.UNVERIFIED && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckBadgeIcon
              className={`cursor-pointer transition-colors ${small ? "size-4" : "size-6"} ${colorsTouse}`}
            />
          </TooltipTrigger>
          <TooltipContent className="z-[70]">
            <p className="max-w-48 break-words">{verifiedText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  );
};

export default VerificationBadge;
