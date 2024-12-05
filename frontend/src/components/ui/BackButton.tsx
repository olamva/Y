import { Button } from "@/components/ui/button";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

const BackButton = () => (
  <header>
    <Button
      className="m-2 flex gap-2 text-xl"
      onClick={() => {
        window.history.back();
      }}
      variant="ghost"
    >
      <ArrowUturnLeftIcon className="size-6" />
      <p>Back</p>
    </Button>
  </header>
);
export default BackButton;
