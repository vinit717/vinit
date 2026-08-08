import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

const IconReveal = ({ icon: Icon, caption }: { icon: LucideIcon; caption: string }) => {
  return (
    <div className="group relative flex flex-col items-center pt-7">
      <span className="absolute top-0 whitespace-nowrap font-serif italic text-xs text-primary opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
        {caption}
      </span>
      <motion.div
        whileHover={{ y: -4, scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={springSnappy}
        className="w-10 h-10 flex items-center justify-center rounded-md border border-border text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors duration-300 cursor-default"
      >
        <Icon className="w-[18px] h-[18px]" />
      </motion.div>
    </div>
  );
};

export default IconReveal;
