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
const PAGE_BG = "#0e0e0e";
const DEBUG_STACKING = process.env.NODE_ENV !== "production";

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

  // Restaurar el z-index original de la(s) página(s) que entraron.
  // Evitamos tocar el z-index de cualquier otra página para que la UI
  // fija (vignette/selector) en la espiral no se quede por detrás.
  document.querySelectorAll<HTMLElement>("[data-page]").forEach((el) => {
    if (el.dataset.pageTransitionOrigZIndex != null) {
      // En home (espiral), bajar de 45 -> 35 al finalizar estaba provocando
      // un reordenado visual (UI de viñeta/toggle quedaba "debajo").
      // Conservamos el z-index elevado en esa página para evitar el salto.
      if (el.getAttribute("data-page") === "spiral") {
        delete el.dataset.pageTransitionOrigZIndex;
        return;
      }
      el.style.zIndex = el.dataset.pageTransitionOrigZIndex;
      delete el.dataset.pageTransitionOrigZIndex;
    }
  });

  if (DEBUG_STACKING && typeof window !== "undefined") {
    const spiralPage = document.querySelector<HTMLElement>('[data-page="spiral"]');
    if (spiralPage) {
      const vignette = spiralPage.querySelector<HTMLElement>(".vignette");
      const viewToggle = spiralPage.querySelector<HTMLElement>(".view-toggle");
      const canvas = spiralPage.querySelector<HTMLCanvasElement>("canvas");
      const mountParent = canvas?.parentElement as HTMLElement | null;
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const probeBottomRight = document.elementFromPoint(vpW - 24, vpH - 24);
      const probeCenter = document.elementFromPoint(vpW / 2, vpH / 2);

      // Log mínimo pero suficiente para detectar el “quién está por encima”.
      // (Si el bug persiste, quiero ver qué z-index calculado tiene cada uno.)
      const payload = {
        at: "finish",
        activePage: spiralPage.getAttribute("data-page"),
        spiralPageZ_inline: spiralPage.style.zIndex,
        spiralPageZ_computed: getComputedStyle(spiralPage).zIndex,
        spiralPagePos: getComputedStyle(spiralPage).position,
        spiralPageOpacity: getComputedStyle(spiralPage).opacity,
        spiralPageVisibility: getComputedStyle(spiralPage).visibility,
        spiralPageDisplay: getComputedStyle(spiralPage).display,
        vignette: vignette
          ? {
              opacity_inline: vignette.style.opacity,
              opacity_computed: getComputedStyle(vignette).opacity,
              display: getComputedStyle(vignette).display,
              visibility: getComputedStyle(vignette).visibility,
              z_inline: vignette.style.zIndex,
              z_computed: getComputedStyle(vignette).zIndex,
            }
          : null,
        viewToggle: viewToggle
          ? {
              z_inline: viewToggle.style.zIndex,
              z_computed: getComputedStyle(viewToggle).zIndex,
              opacity: getComputedStyle(viewToggle).opacity,
              display: getComputedStyle(viewToggle).display,
              visibility: getComputedStyle(viewToggle).visibility,
              pointerEvents: getComputedStyle(viewToggle).pointerEvents,
              rect: viewToggle.getBoundingClientRect().toJSON(),
            }
          : null,
        mountParent: mountParent
          ? {
              z_inline: mountParent.style.zIndex,
              z_computed: getComputedStyle(mountParent).zIndex,
              opacity: getComputedStyle(mountParent).opacity,
              display: getComputedStyle(mountParent).display,
              visibility: getComputedStyle(mountParent).visibility,
            }
          : null,
        probe: {
          bottomRightTag: probeBottomRight?.tagName ?? null,
          bottomRightClass: probeBottomRight?.className ?? null,
          centerTag: probeCenter?.tagName ?? null,
          centerClass: probeCenter?.className ?? null,
        },
      };
      // eslint-disable-next-line no-console
      console.log("[pageTransition] stack@finish", payload);
      // eslint-disable-next-line no-console
      console.log("[pageTransition] stack@finish:json", JSON.stringify(payload));
    }
  }

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

  // Snapshot con el scroll actual; luego subimos y bloqueamos overflow
  const outgoing = snapshotPage(page);
  page.style.visibility = "hidden";
  page.style.pointerEvents = "none";

  window.scrollTo(0, 0);
  document.documentElement.classList.add("is-page-transitioning");

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

  window.scrollTo(0, 0);

  // Fijar al viewport durante la entrada: si no, scale + origin bottom
  // usan toda la altura del documento (hero+manifiesto+cta) y la página
  // parece crecer a medias y luego “salta” al soltar el transform.
  el.style.visibility = "visible";
  el.style.pointerEvents = "none";
  if (DEBUG_STACKING && typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("[pageTransition] playPageEnter", {
      dataPage: el.getAttribute("data-page"),
      z_inline_before: el.style.zIndex,
    });
  }
  if (el.dataset.pageTransitionOrigZIndex === undefined) {
    el.dataset.pageTransitionOrigZIndex = el.style.zIndex;
  }
  el.style.zIndex = "45";
  el.style.position = "fixed";
  el.style.left = "0";
  el.style.top = "0";
  el.style.width = "100%";
  el.style.height = "100vh";
  el.style.maxHeight = "100vh";
  el.style.overflow = "hidden";

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
        window.scrollTo(0, 0);
        // Dejamos la animación en su estado final y luego limpiamos transform:
        // si queda un transform residual en [data-page], los hijos `position: fixed`
        // (como el toggle de la espiral) pasan a posicionarse respecto a ese
        // contenedor transformado y "saltan" fuera del viewport.
        gsap.set(el, { y: 0, scale: 1, force3D: true });
        gsap.set(el, { clearProps: "transform" });

        // Al volver a home, aseguramos que la viñeta quede visible
        // aunque hubiese quedado algún tween previo sobre ".vignette".
        if (el.getAttribute("data-page") === "spiral") {
          const vignette = el.querySelector<HTMLElement>(".vignette");
          if (vignette) gsap.set(vignette, { opacity: 1 });
        }

        const isSpiral = el.getAttribute("data-page") === "spiral";

        el.style.position = "relative";
        el.style.left = "";
        el.style.top = "";
        // Importante: en la home (espiral) casi todos los hijos están fuera del
        // flujo (absolute/fixed). Si quitamos `height`, el contenedor colapsa a 0
        // y la viñeta (inset:0) "desaparece".
        el.style.width = isSpiral ? "100vw" : "";
        el.style.height = isSpiral ? "100vh" : "";
        el.style.maxHeight = "";
        el.style.overflow = isSpiral ? "hidden" : "";
        el.style.pointerEvents = "";

        markEnterDone();
      },
    }
  );

  return true;
}
