import { motion } from "framer-motion";
import { brandSwatches, applyBrandHue, useBrandHue } from "@/lib/themes";
import { springSnappy } from "@/lib/motion";

type Props = {
  /** "stage" sits on the dark hero panel and needs light-on-dark treatment. */
  variant?: "card" | "stage";
};

const ThemePicker = ({ variant = "card" }: Props) => {
  const hue = useBrandHue();
  const onStage = variant === "stage";

  return (
    <div className={onStage ? "flex items-center gap-3" : "mt-6 pt-6 border-t border-border"}>
      {!onStage && (
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          This whole site runs on the system above — even the desk up top. Try a
          different brand colour.
        </p>
      )}
      <div className="flex items-center gap-2.5">
        {brandSwatches.map((swatch) => (
          <motion.button
            key={swatch.name}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              applyBrandHue(swatch.hue);
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            transition={springSnappy}
            aria-label={`Switch accent color to ${swatch.name}`}
            aria-pressed={hue === swatch.hue}
            className={`relative rounded-full ${
              onStage ? "w-5 h-5 border border-white/20" : "w-6 h-6 border border-foreground/10"
            }`}
            style={{ backgroundColor: `hsl(${swatch.hue} 68% 50%)` }}
          >
            {hue === swatch.hue && (
              <motion.span
                layoutId={`theme-ring-${variant}`}
                transition={springSnappy}
                className={`absolute -inset-[3px] rounded-full border-2 ${
                  onStage ? "border-white/70" : "border-foreground/50"
                }`}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ThemePicker;
