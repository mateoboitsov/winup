"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Smooth scroll global con Lenis.
 *
 * - En la portada "/" no hay scroll de página (la escena 3D captura wheel), así que
 *   destruimos la instancia para no interferir.
 * - Durante transiciones de página se bloquea el scroll con CSS, así que pauseamos Lenis.
 */
export default function LenisSmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const classObserverRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // La home (/) usa control de wheel manual en la escena 3D.
    if (pathname === "/") return;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };

    rafIdRef.current = requestAnimationFrame(raf);

    const syncPausedState = () => {
      const transitioning = document.documentElement.classList.contains("is-page-transitioning");
      if (transitioning) lenis.stop();
      else lenis.start();
    };

    syncPausedState();

    // Reaccionar cuando pageTransition añade/quita el lock de overflow.
    const observer = new MutationObserver(syncPausedState);
    classObserverRef.current = observer;
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      classObserverRef.current = null;

      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;

      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  return null;
}

