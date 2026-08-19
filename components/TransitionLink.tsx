"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { navigateWithPageTransition } from "@/lib/pageTransition";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "onClick" | "className" | "children">;

export default function TransitionLink({
  href,
  className,
  children,
  ...rest
}: Props) {
  const router = useRouter();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateWithPageTransition(router, href);
  };

  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      suppressHydrationWarning
      {...rest}
    >
      {children}
    </a>
  );
}
