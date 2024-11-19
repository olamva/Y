import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const VerificationBadge = ({
  verified = false,
  customColors,
}: {
  verified?: boolean;
  customColors?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        {verified && (
          <CheckBadgeIcon
            className={`size-6 cursor-pointer ${customColors || "text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-500"}`}
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

export default VerificationBadge;
