"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { coverUrl } from "@/lib/projects";
import { SERVICES, serviceHref } from "@/lib/services";
import { navigateWithPageTransition } from "@/lib/pageTransition";

gsap.registerPlugin(SplitText);

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/servicios" },
  { label: "Proyectos", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contacto", href: "/contacto" },
] as const;

const SUBMENU_DURATION = 0.55;
const SUBMENU_EASE = "power3.inOut";

export default function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const onProject = /^\/proyecto\/\d+/.test(pathname);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [logoLeft, setLogoLeft] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const servicesLinkRef = useRef<HTMLAnchorElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const servicesOpenRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const splitRef = useRef<SplitText | null>(null);
  const titlesTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);

  const syncLogoLeft = () => {
    const logo = logoRef.current;
    if (!logo) return;
    setLogoLeft(logo.getBoundingClientRect().left);
  };

  const revertSplit = () => {
    titlesTweenRef.current?.kill();
    titlesTweenRef.current = null;
    splitRef.current?.revert();
    splitRef.current = null;
  };

  const openServices = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    // Si aún está abierto y los textos iban saliendo, los devolvemos ya
    const lines = splitRef.current?.lines;
    if (servicesOpenRef.current && lines?.length) {
      titlesTweenRef.current?.kill();
      titlesTweenRef.current = gsap.to(lines, {
        yPercent: 0,
        duration: 0.45,
        stagger: 0.04,
        ease: "power3.out",
        overwrite: true,
      });
    }

    setServicesOpen(true);
  };

  const closeServices = () => {
    // Los textos empiezan a salir al instante; el panel espera el delay
    const lines = splitRef.current?.lines;
    if (lines?.length) {
      titlesTweenRef.current?.kill();
      titlesTweenRef.current = gsap.to(lines, {
        yPercent: 100,
        duration: 0.35,
        stagger: 0.03,
        ease: "power3.in",
        overwrite: true,
      });
    }

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setServicesOpen(false);
      closeTimerRef.current = null;
    }, 180);
  };

  /** Cierre inmediato sin animación (p. ej. al navegar a un servicio). */
  const forceCloseServices = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const el = submenuRef.current;
    if (el) {
      gsap.killTweensOf(el);
      gsap.set(el, { height: 0 });
      el.hidden = true;
      el.setAttribute("aria-hidden", "true");
      el.style.pointerEvents = "none";
    }
    revertSplit();
    servicesOpenRef.current = false;
    setServicesOpen(false);
  };

  useEffect(() => {
    setServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    syncLogoLeft();
    window.addEventListener("resize", syncLogoLeft);
    return () => window.removeEventListener("resize", syncLogoLeft);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      revertSplit();
    };
  }, []);

  useEffect(() => {
    const el = submenuRef.current;
    if (!el) return;

    const opening = servicesOpen;
    servicesOpenRef.current = opening;
    gsap.killTweensOf(el);

    if (opening) {
      syncLogoLeft();
      el.hidden = false;
      el.setAttribute("aria-hidden", "false");
      el.style.pointerEvents = "auto";

      revertSplit();

      const titles = el.querySelectorAll<HTMLElement>(".nav-submenu-title");
      const split = SplitText.create(titles, {
        type: "lines",
        mask: "lines",
      });
      splitRef.current = split;

      gsap.set(split.lines, { yPercent: 100 });

      const tl = gsap.timeline();
      tl.to(
        el,
        {
          height: "auto",
          duration: SUBMENU_DURATION,
          ease: SUBMENU_EASE,
          overwrite: true,
        },
        0
      );
      tl.to(
        split.lines,
        {
          yPercent: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power3.out",
          overwrite: true,
        },
        0.15
      );
      titlesTweenRef.current = tl;
      return;
    }

    // Los textos ya pueden estar saliendo desde closeServices; solo cerramos el panel
    gsap.to(el, {
      height: 0,
      duration: SUBMENU_DURATION,
      ease: SUBMENU_EASE,
      overwrite: true,
      onComplete: () => {
        if (servicesOpenRef.current) return;
        revertSplit();
        el.hidden = true;
        el.setAttribute("aria-hidden", "true");
        el.style.pointerEvents = "none";
      },
    });
  }, [servicesOpen]);

  useEffect(() => {
    if (!servicesOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setServicesOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [servicesOpen]);

  const goHome = () => {
    setServicesOpen(false);
    if (pathname === "/") return;

    const match = pathname.match(/^\/proyecto\/(\d+)/);

    // Desde contacto/servicios: misma transición de página que el resto
    if (!match) {
      navigateWithPageTransition(router, "/");
      return;
    }

    const animateProjectExit = () =>
      new Promise<void>((resolve) => {
        const projectRoot = document.querySelector<HTMLElement>('div[data-page="project"]');
        if (!projectRoot) {
          resolve();
          return;
        }

        const revealEls = projectRoot.querySelectorAll<HTMLElement>(".reveal");
        const gradientEl = projectRoot.querySelector<HTMLElement>(".hero-gradient-fade");

        // Evita acumulación de tweens si el usuario pulsa varias veces.
        gsap.killTweensOf(revealEls);
        if (gradientEl) gsap.killTweensOf(gradientEl);

        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete: () => resolve() });
        if (revealEls.length) {
          tl.to(
            revealEls,
            {
              y: 16,
              opacity: 0,
              duration: 0.35,
              stagger: 0.04,
            },
            0
          );
        }
        if (gradientEl) {
          tl.to(
            gradientEl,
            {
              opacity: 0,
              duration: 0.3,
            },
            0
          );
        }

        if (!revealEls.length && !gradientEl) resolve();
      });

    const navigate = () => {
      const id = Number(match[1]);
      document.body.style.background = `#000 url("${coverUrl(id)}") center / cover no-repeat`;
      animateProjectExit().then(() => {
        router.push("/");
      });
    };

    // Si estamos scrolleados hacia abajo dentro del proyecto, primero subimos
    // con scroll suave hasta arriba (donde está el hero) y SOLO entonces
    // lanzamos la animación de cierre hacia la espiral => relevo sin salto.
    if (window.scrollY > 0) {
      // Con Lenis activo, evitamos "smooth" nativo para que el control lo tenga Lenis.
      window.scrollTo({ top: 0, behavior: "auto" });
      let tries = 0;
      const waitTop = () => {
        // Cuando llegamos arriba (o tras un tope de seguridad) navegamos.
        if (window.scrollY <= 1 || tries > 120) {
          navigate();
          return;
        }
        tries += 1;
        requestAnimationFrame(waitTop);
      };
      requestAnimationFrame(waitTop);
      return;
    }

    navigate();
  };

  const onNavClick = (href: string, label: string) => {
    if (label === "Servicios") {
      return;
    }
    setServicesOpen(false);
    if (href === "/") {
      goHome();
      return;
    }
    navigateWithPageTransition(router, href);
  };

  return (
    <div
      ref={barRef}
      className={`site-nav-bar${servicesOpen ? " is-services-open" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "2rem clamp(1.5rem, 5vw, 4.5rem) 0",
        pointerEvents: "none",
      }}
    >
      <nav className="content-width site-nav">
        <div className="nav-brand">
          <button
            ref={logoRef}
            type="button"
            className={`nav-logo${onProject ? "" : " is-visible"}`}
            aria-label="Inicio"
            aria-hidden={onProject}
            tabIndex={onProject ? -1 : 0}
            onClick={goHome}
          />
          <button
            type="button"
            className={`nav-back ui-label${onProject ? " is-visible" : ""}`}
            aria-hidden={!onProject}
            tabIndex={onProject ? 0 : -1}
            onClick={goHome}
          >
            <ArrowLeft size={16} strokeWidth={2.25} color="currentColor" />
            Volver a todos los proyectos
          </button>
        </div>
        <ul className="nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li
              key={label}
              className={label === "Servicios" ? "nav-item-services" : undefined}
              onMouseEnter={label === "Servicios" ? openServices : undefined}
              onMouseLeave={label === "Servicios" ? closeServices : undefined}
            >
              <a
                ref={label === "Servicios" ? servicesLinkRef : undefined}
                className={`ui-label${label === "Servicios" && servicesOpen ? " is-active" : ""}`}
                href={href}
                aria-expanded={label === "Servicios" ? servicesOpen : undefined}
                aria-controls={label === "Servicios" ? "nav-services-submenu" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavClick(href, label);
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="nav-services-overlay"
        aria-hidden="true"
        onMouseEnter={closeServices}
      />

      <div
        ref={submenuRef}
        id="nav-services-submenu"
        className="nav-submenu"
        hidden
        aria-hidden="true"
        style={{ ["--logo-left" as string]: `${logoLeft}px` }}
        onMouseEnter={openServices}
        onMouseLeave={closeServices}
      >
        <div className="nav-submenu-inner">
          <span className="nav-submenu-badge">Nuestros servicios</span>
          <ul className="nav-submenu-list">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <a
                  className="nav-submenu-title"
                  href={serviceHref(service.slug)}
                  onClick={(e) => {
                    e.preventDefault();
                    forceCloseServices();
                    navigateWithPageTransition(router, serviceHref(service.slug));
                  }}
                >
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
