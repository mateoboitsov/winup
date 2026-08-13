"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { playPageEnter } from "@/lib/pageTransition";
import SiteFooter from "@/components/SiteFooter";

function SoftPageSurface({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    playPageEnter(el);
  }, []);

  return (
    <div ref={ref} data-page={name} className="soft-page">
      {children}
      <SiteFooter />
    </div>
  );
}

/** Remonta en cada ruta para que la transición entre subpáginas sea limpia. */
export default function SoftPage({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SoftPageSurface key={pathname} name={name}>
      {children}
    </SoftPageSurface>
  );
}
