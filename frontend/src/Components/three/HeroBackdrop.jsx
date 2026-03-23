import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { NetflixAuraScene } from "./NetflixAuraScene";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

function ThemeWash() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background/70 via-transparent to-background/90",
        resolvedTheme === "light" && "from-background/85 via-background/40 to-background/95"
      )}
      aria-hidden
    />
  );
}

/**
 * Full-viewport WebGL hero for the auth landing page.
 * Lazy-loaded with Homepage; skips GPU work when reduced-motion is set.
 */
export default function HeroBackdrop() {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div
        className="fixed inset-0 z-0 min-h-[100dvh] w-full bg-gradient-to-br from-background via-muted/40 to-primary/20"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-0 min-h-[100dvh] w-full overflow-hidden"
      aria-hidden
    >
      <Canvas
        className="!absolute inset-0 h-full w-full touch-none"
        camera={{ position: [0, 0.2, 14], fov: 48 }}
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[8, 6, 10]} intensity={1.1} color="#ff3355" />
        <pointLight position={[-10, -4, 4]} intensity={0.35} color="#4466ff" />
        <Suspense fallback={null}>
          <NetflixAuraScene />
        </Suspense>
      </Canvas>
      <ThemeWash />
    </div>
  );
}
