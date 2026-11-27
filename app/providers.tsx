"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { transition } from "@/components/motion/tokens";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]} enableSystem={false}>
      {/* reducedMotion="user": with prefers-reduced-motion, Motion drops transform/layout animation, keeps opacity. */}
      <MotionConfig reducedMotion="user" transition={transition.base}>
        {children}
      </MotionConfig>
    </ThemeProvider>
  );
}
