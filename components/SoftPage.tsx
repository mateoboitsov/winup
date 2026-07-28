"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { playPageEnter } from "@/lib/pageTransition";

export default function SoftPage({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    playPageEnter(el);
  }, [pathname]);

  return (
    <div ref={ref} data-page={name} className="soft-page">
      {children}
    </div>
  );
}
