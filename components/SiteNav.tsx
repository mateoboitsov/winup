"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
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
const MOBILE_BREAKPOINT = 720;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

export default function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const onProject = /^\/proyecto\/\d+/.test(pathname);
  const isMobile = useIsMobile();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [logoLeft, setLogoLeft] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const servicesLinkRef = useRef<HTMLAnchorElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileServicesRef = useRef<HTMLDivElement>(null);
  const servicesOpenRef = useRef(false);
  const mobileMenuOpenRef = useRef(false);
  const mobileServicesOpenRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const splitRef = useRef<SplitText | null>(null);
  const mobileSplitRef = useRef<SplitText | null>(null);
  const mobileServicesSplitRef = useRef<SplitText | null>(null);
  const titlesTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const mobileMenuTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const mobileServicesTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);

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

  const revertMobileSplit = () => {
    mobileMenuTweenRef.current?.kill();
    mobileMenuTweenRef.current = null;
    mobileSplitRef.current?.revert();
    mobileSplitRef.current = null;
  };

  const revertMobileServicesSplit = () => {
    mobileServicesTweenRef.current?.kill();
    mobileServicesTweenRef.current = null;
    mobileServicesSplitRef.current?.revert();
    mobileServicesSplitRef.current = null;
  };

  const resetMobileServicesPanel = () => {
    const el = mobileServicesRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.set(el, { height: 0 });
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
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
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
      setMobileServicesOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    syncLogoLeft();
    window.addEventListener("resize", syncLogoLeft);
    return () => window.removeEventListener("resize", syncLogoLeft);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      revertSplit();
      revertMobileSplit();
      revertMobileServicesSplit();
    };
  }, []);

  useEffect(() => {
    const el = mobileMenuRef.current;
    if (!el || !isMobile) return;

    const opening = mobileMenuOpen;
    mobileMenuOpenRef.current = opening;
    gsap.killTweensOf(el);

    if (opening) {
      el.hidden = false;
      el.setAttribute("aria-hidden", "false");
      el.style.pointerEvents = "auto";

      revertMobileSplit();

      const titles = el.querySelectorAll<HTMLElement>(".nav-mobile-title");
      const split = SplitText.create(titles, {
        type: "lines",
        mask: "lines",
      });
      mobileSplitRef.current = split;
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
      mobileMenuTweenRef.current = tl;
      return;
    }

    const lines = mobileSplitRef.current?.lines;
    if (lines?.length) {
      gsap.to(lines, {
        yPercent: 100,
        duration: 0.35,
        stagger: 0.03,
        ease: "power3.in",
        overwrite: true,
      });
    }

    gsap.to(el, {
      height: 0,
      duration: SUBMENU_DURATION,
      ease: SUBMENU_EASE,
      overwrite: true,
      delay: lines?.length ? 0.08 : 0,
      onComplete: () => {
        if (mobileMenuOpenRef.current) return;
        revertMobileSplit();
        revertMobileServicesSplit();
        resetMobileServicesPanel();
        el.hidden = true;
        el.setAttribute("aria-hidden", "true");
        el.style.pointerEvents = "none";
      },
    });
  }, [mobileMenuOpen, isMobile]);

  useEffect(() => {
    const el = mobileServicesRef.current;
    if (!el || !isMobile || !mobileMenuOpen) return;

    const opening = mobileServicesOpen;
    mobileServicesOpenRef.current = opening;
    gsap.killTweensOf(el);

    if (opening) {
      el.hidden = false;
      el.setAttribute("aria-hidden", "false");

      revertMobileServicesSplit();

      const titles = el.querySelectorAll<HTMLElement>(".nav-submenu-title");
      const split = SplitText.create(titles, {
        type: "lines",
        mask: "lines",
      });
      mobileServicesSplitRef.current = split;
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
          duration: 0.55,
          stagger: 0.04,
          ease: "power3.out",
          overwrite: true,
        },
        0.12
      );
      mobileServicesTweenRef.current = tl;
      return;
    }

    const lines = mobileServicesSplitRef.current?.lines;
    if (lines?.length) {
      gsap.to(lines, {
        yPercent: 100,
        duration: 0.3,
        stagger: 0.025,
        ease: "power3.in",
        overwrite: true,
      });
    }

    gsap.to(el, {
      height: 0,
      duration: SUBMENU_DURATION,
      ease: SUBMENU_EASE,
      overwrite: true,
      delay: lines?.length ? 0.06 : 0,
      onComplete: () => {
        if (mobileServicesOpenRef.current) return;
        revertMobileServicesSplit();
        el.hidden = true;
        el.setAttribute("aria-hidden", "true");
      },
    });
  }, [mobileServicesOpen, mobileMenuOpen, isMobile]);

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
    if (!servicesOpen && !mobileMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        setMobileServicesOpen(false);
        return;
      }
      setServicesOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [servicesOpen, mobileMenuOpen]);

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
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
    if (href === "/") {
      goHome();
      return;
    }
    navigateWithPageTransition(router, href);
  };

  const onMobileNavClick = (href: string, label: string) => {
    if (label === "Servicios") {
      setMobileServicesOpen((open) => !open);
      return;
    }
    onNavClick(href, label);
  };

  const onMobileServiceClick = (slug: string) => {
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
    forceCloseServices();
    navigateWithPageTransition(router, serviceHref(slug));
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((open) => {
      if (open) {
        setMobileServicesOpen(false);
        return false;
      }
      return true;
    });
  };

  return (
    <div
      ref={barRef}
      className={`site-nav-bar${servicesOpen ? " is-services-open" : ""}${mobileMenuOpen ? " is-mobile-open" : ""}`}
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
            <span className="nav-back-label nav-back-label--full">Volver a todos los proyectos</span>
            <span className="nav-back-label nav-back-label--short">Volver</span>
          </button>
        </div>
        <ul className="nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li
              key={label}
              className={label === "Servicios" ? "nav-item-services" : undefined}
              onMouseEnter={!isMobile && label === "Servicios" ? openServices : undefined}
              onMouseLeave={!isMobile && label === "Servicios" ? closeServices : undefined}
            >
              <a
                ref={label === "Servicios" ? servicesLinkRef : undefined}
                className={`ui-label${label === "Servicios" && servicesOpen ? " is-active" : ""}`}
                href={href}
                aria-expanded={label === "Servicios" ? servicesOpen : undefined}
                aria-controls={label === "Servicios" ? "nav-services-submenu" : undefined}
                suppressHydrationWarning
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
        <button
          type="button"
          className={`nav-toggle ui-label${mobileMenuOpen ? " is-active" : ""}`}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
          aria-controls="nav-mobile-panel"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? "Cerrar" : "Menú"}
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        id="nav-mobile-panel"
        className="nav-mobile-panel"
        hidden
        aria-hidden="true"
      >
        <div className="nav-mobile-inner content-width">
          <ul className="nav-mobile-links">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                {label === "Servicios" ? (
                  <button
                    type="button"
                    className={`nav-mobile-expand${mobileServicesOpen ? " is-active" : ""}`}
                    aria-expanded={mobileServicesOpen}
                    aria-controls="nav-mobile-services"
                    onClick={() => setMobileServicesOpen((open) => !open)}
                  >
                    <span className="nav-mobile-title nav-submenu-title">{label}</span>
                    <span className="nav-mobile-expand-meta">
                      <span className="nav-mobile-expand-label ui-label">
                        {mobileServicesOpen ? "Ocultar" : "Ver servicios"}
                      </span>
                      <ChevronDown
                        size={18}
                        strokeWidth={2.25}
                        className={`nav-mobile-expand-icon accent-arrow${mobileServicesOpen ? " is-open" : ""}`}
                        aria-hidden
                      />
                    </span>
                  </button>
                ) : (
                  <a
                    className="nav-mobile-title nav-submenu-title"
                    href={href}
                    suppressHydrationWarning
                    onClick={(e) => {
                      e.preventDefault();
                      onMobileNavClick(href, label);
                    }}
                  >
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div
            ref={mobileServicesRef}
            id="nav-mobile-services"
            className="nav-mobile-services-panel"
            hidden
            aria-hidden="true"
          >
            <div className="nav-mobile-services-inner">
              <span className="nav-submenu-badge">Nuestros servicios</span>
              <ul className="nav-submenu-list">
                {SERVICES.map((service) => (
                  <li key={service.slug}>
                    <a
                      className="nav-submenu-title"
                      href={serviceHref(service.slug)}
                      suppressHydrationWarning
                      onClick={(e) => {
                        e.preventDefault();
                        onMobileServiceClick(service.slug);
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
      </div>

      <div
        className="nav-services-overlay"
        aria-hidden="true"
        onMouseEnter={closeServices}
        onClick={() => {
          if (!isMobile) return;
          setMobileMenuOpen(false);
          setMobileServicesOpen(false);
        }}
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
                  suppressHydrationWarning
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
