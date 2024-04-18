import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface MainPageParameters {
  title: string;
  description: string;
  handleFunction: () => {};
}

export function MainPageSectionButton({
  title,
  description,
  handleFunction,
}: MainPageParameters) {
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex lg:h-44 sm:h-28 xsm:h-28 w-full items-start select-none flex-col rounded-xl border bg-gradient-to-b from-muted/50 to-muted no-underline outline-none focus:shadow-lg hover:shadow-lg"
      >
        <Button
          variant="ghost"
          onClick={handleFunction}
          className="h-full w-full"
        >
          <div className="text-xl font-medium text-left">
            {title}
            <p className="text-sm leading-tight text-muted-foreground">
              {description}
            </p>
          </div>
        </Button>
      </motion.button>
    </>
  );
}
