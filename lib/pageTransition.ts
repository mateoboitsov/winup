"use client";

import gsap from "gsap";
import { transition } from "@/lib/transition";

type RouterLike = { push: (href: string) => void };

export const pageTransition = {
  busy: false,
  pendingEnter: false,
};

const EXIT_DURATION = 1.3;
const ENTER_DURATION = 0.8;
const EASE = "power3.inOut";
const PAGE_BG = "#1a1a1a";

/** Última navegación pedida mientras hay una transición en curso (no se apilan). */
let queued: { router: RouterLike; href: string } | null = null;

let enterDone = false;
let exitDone = false;
let failsafeId: ReturnType<typeof setTimeout> | null = null;
let activeRouter: RouterLike | null = null;

function ensureBackdrop(): HTMLElement {
  let backdrop = document.querySelector<HTMLElement>(".page-transition-backdrop");
  if (backdrop) return backdrop;

  backdrop = document.createElement("div");
  backdrop.className = "page-transition-backdrop";
  Object.assign(backdrop.style, {
    position: "fixed",
    inset: "0",
    zIndex: "29",
    background: "#000",
    pointerEvents: "none",
  });
  document.body.appendChild(backdrop);
  return backdrop;
}

function clearTransitionLayers() {
  document
    .querySelectorAll(".page-transition-out, .page-transition-backdrop")
    .forEach((el) => el.remove());
}

function snapshotPage(page: HTMLElement): HTMLElement {
  ensureBackdrop();

  const wrap = document.createElement("div");
  wrap.className = "page-transition-out";
  Object.assign(wrap.style, {
    position: "fixed",
    inset: "0",
    // Debajo de la página que entra; por encima del fondo negro
    zIndex: "30",
    overflow: "hidden",
    pointerEvents: "none",
    transformOrigin: "center bottom",
    background: "transparent",
    willChange: "transform, opacity",
  });

  // Superficie de página (#1a1a1a): al hacer zoomOut se ve el negro del backdrop
  const surface = document.createElement("div");
  Object.assign(surface.style, {
    position: "absolute",
    inset: "0",
    background: PAGE_BG,
    overflow: "hidden",
    borderRadius: "15px",
  });
  wrap.appendChild(surface);

  const canvas = page.querySelector("canvas");
  if (canvas instanceof HTMLCanvasElement) {
    const img = document.createElement("img");
    try {
      img.src = canvas.toDataURL("image/webp", 0.92);
    } catch {
      img.src = canvas.toDataURL("image/png");
    }
    Object.assign(img.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
    });
    surface.appendChild(img);

    const vignette = page.querySelector(".vignette");
    if (vignette) surface.appendChild(vignette.cloneNode(true));
  } else {
    const clone = page.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("script").forEach((s) => s.remove());
    clone.removeAttribute("data-page");
    Object.assign(clone.style, {
      position: "absolute",
      top: `${-window.scrollY}px`,
      left: "0",
      width: "100%",
      margin: "0",
      transform: "none",
      animation: "none",
      background: PAGE_BG,
    });
    surface.appendChild(clone);
  }

  document.body.appendChild(wrap);
  return wrap;
}

function flushQueue() {
  const next = queued;
  queued = null;
  if (!next || !activeRouter) return;

  const router = next.router;
  const href = next.href;
  activeRouter = null;

  if (window.location.pathname === href) return;
  navigateWithPageTransition(router, href);
}

/** Libera el lock solo cuando entrada y salida han terminado; luego lanza la cola. */
function tryFinishTransition() {
  if (!enterDone || !exitDone) return;

  pageTransition.busy = false;
  pageTransition.pendingEnter = false;
  document.documentElement.classList.remove("is-page-transitioning");
  clearTransitionLayers();

  // Quitar z-index elevado de la página entrante (tras acabar ambas animaciones)
  document.querySelectorAll<HTMLElement>("[data-page]").forEach((el) => {
    el.style.zIndex = "";
  });

  if (failsafeId != null) {
    clearTimeout(failsafeId);
    failsafeId = null;
  }

  flushQueue();
}

function markEnterDone() {
  enterDone = true;
  tryFinishTransition();
}

function markExitDone() {
  exitDone = true;
  tryFinishTransition();
}

/** Navega con zoomOutDown (salida) + inUp (entrada). Si ya hay una en curso, encola. */
export function navigateWithPageTransition(router: RouterLike, href: string) {
  if (typeof window !== "undefined" && window.location.pathname === href) {
    // Mismo destino: cancelar cola pendiente hacia ahí
    if (queued?.href === href) queued = null;
    return;
  }

  if (pageTransition.busy) {
    // Sustituye la petición anterior: solo importa el último clic
    queued = { router, href };
    return;
  }

  const page = document.querySelector<HTMLElement>("[data-page]");
  if (!page) {
    router.push(href);
    return;
  }

  pageTransition.busy = true;
  pageTransition.pendingEnter = true;
  enterDone = false;
  exitDone = false;
  activeRouter = router;
  // Si salimos de un proyecto con esta transición, no dejar morph inverso pendiente
  transition.active = false;
  document.documentElement.classList.add("is-page-transitioning");

  const outgoing = snapshotPage(page);
  router.push(href);

  if (failsafeId != null) clearTimeout(failsafeId);
  failsafeId = setTimeout(() => {
    enterDone = true;
    exitDone = true;
    tryFinishTransition();
  }, EXIT_DURATION * 1000 + 300);

  // zoomOutDown + fade de opacidad sobre fondo negro
  gsap.killTweensOf(outgoing);
  gsap.fromTo(
    outgoing,
    {
      scale: 1,
      y: 0,
      opacity: 1,
    },
    {
      scale: 0.1,
      y: window.innerHeight,
      opacity: 0,
      duration: EXIT_DURATION,
      ease: EASE,
      force3D: true,
      overwrite: true,
      onComplete: () => {
        gsap.killTweensOf(outgoing);
        outgoing.remove();
        document.querySelector(".page-transition-backdrop")?.remove();
        markExitDone();
      },
    }
  );
}

export function playPageEnter(el: HTMLElement) {
  if (!pageTransition.pendingEnter) {
    // Sin entrada pendiente: no tocamos busy (puede haber salida aún en curso)
    return false;
  }

  pageTransition.pendingEnter = false;

  // Encima de la salida (nav sigue en 50). Se resetea al terminar toda la transición.
  el.style.zIndex = "45";
  el.style.position = "relative";

  // zoomInUp = inverso del zoomOutDown (mismo origen inferior, sin fade)
  gsap.killTweensOf(el);
  gsap.fromTo(
    el,
    {
      y: window.innerHeight,
      scale: 0.8,
      transformOrigin: "center bottom",
    },
    {
      y: 0,
      scale: 1,
      duration: ENTER_DURATION,
      ease: EASE,
      force3D: true,
      overwrite: true,
      immediateRender: true,
      onComplete: () => {
        // Mantener capa 3D; no clearProps (parpadeo WebGL)
        gsap.set(el, { y: 0, scale: 1, force3D: true });
        markEnterDone();
      },
    }
  );

  return true;
}
