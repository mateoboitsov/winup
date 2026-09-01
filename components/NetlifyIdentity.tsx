"use client";

import Script from "next/script";

declare global {
  interface Window {
    netlifyIdentity?: {
      on: (event: string, cb: (user?: unknown) => void) => void;
    };
  }
}

export default function NetlifyIdentity() {
  return (
    <Script
      id="netlify-identity"
      src="https://identity.netlify.com/v1/netlify-identity-widget.js"
      strategy="afterInteractive"
      onLoad={() => {
        const identity = window.netlifyIdentity;
        if (!identity) return;

        identity.on("init", (user) => {
          if (user) return;
          identity.on("login", () => {
            window.location.href = "/admin/";
          });
        });
      }}
    />
  );
}
