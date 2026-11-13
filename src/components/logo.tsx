import { motion } from "framer-motion";

export function Logo({ size = 28, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        initial={{ rotate: -20, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: size, height: size }}
        className="relative grid place-items-center"
      >
        <div
          className="absolute inset-0 rounded-[8px] bg-gradient-to-br from-primary to-accent opacity-90"
          style={{ filter: "blur(8px)" }}
        />
        <div className="relative grid h-full w-full place-items-center rounded-[8px] bg-gradient-to-br from-primary to-accent shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--primary)_70%,transparent)]">
          <svg viewBox="0 0 24 24" className="h-[60%] w-[60%] text-white" fill="none">
            <path d="M5 19V5l14 14V5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>
      {withWord && (
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            INNOZENX
          </span>
          <span className="font-display text-[11px] font-medium tracking-[0.18em] text-muted-foreground">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
