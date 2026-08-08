import { Suspense, lazy, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ease } from "@/lib/motion";
import { SPOT_CAPTIONS, type Spot } from "@/components/three/spots";

/* three.js is ~600kb — keep it off the critical path so the copy paints first. */
const SystemScene = lazy(() => import("@/components/three/SystemScene"));

const CropMark = ({ className }: { className: string }) => (
  <span className={`absolute w-3 h-3 pointer-events-none ${className}`}>
    <span className="absolute inset-x-0 top-1/2 h-px bg-foreground/15" />
    <span className="absolute inset-y-0 left-1/2 w-px bg-foreground/15" />
  </span>
);

const SystemStage = () => {
  const [spot, setSpot] = useState<Spot>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease }}
      className="relative min-w-0"
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground) / 0.09) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 62% 58% at 50% 50%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 62% 58% at 50% 50%, black, transparent)",
        }}
      />

      <CropMark className="top-0 left-0" />
      <CropMark className="top-0 right-0" />
      <CropMark className="bottom-10 left-0" />
      <CropMark className="bottom-10 right-0" />

      <div className="relative aspect-square lg:aspect-[4/3.6] -mx-4">
        <Suspense fallback={null}>
          <SystemScene onHover={setSpot} />
        </Suspense>
      </div>

      {/* Caption rail — holds its height so the layout never jumps on hover. */}
      <div className="relative h-10 flex items-center justify-center px-4">
        <AnimatePresence mode="wait" initial={false}>
          {spot ? (
            <motion.p
              key={spot}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="absolute font-serif italic text-[15px] text-primary text-center"
            >
              {SPOT_CAPTIONS[spot]}
            </motion.p>
          ) : (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              hover the desk
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SystemStage;
