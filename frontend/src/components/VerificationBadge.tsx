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
  const VerifiedColors =
    customColors ||
    "text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-500";

  const DeveloperColors =
    "text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-500";

  const MadsColors =
    "text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-500";

  const ColorsToUse = () => {
    switch (verified) {
      case VerifiedTiers.VERIFIED:
        return VerifiedColors;
      case VerifiedTiers.MADS:
        return MadsColors;
      case VerifiedTiers.DEVELOPER:
        return DeveloperColors;
    }
  };

  console.log(verified);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {verified !== VerifiedTiers.UNVERIFIED && (
            <CheckBadgeIcon
              className={`${small ? "size-4" : "size-6"} cursor-pointer ${ColorsToUse()}`}
            />
          )}
        </TooltipTrigger>
        <TooltipContent className="z-[70]">
          <p className="max-w-48 break-words">
            This user has been verified as one of the devlopers of this site.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;
