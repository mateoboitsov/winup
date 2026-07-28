"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { coverUrl } from "@/lib/projects";
import { navigateWithPageTransition } from "@/lib/pageTransition";

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/servicios" },
  { label: "Proyectos", href: "/" },
  { label: "Contacto", href: "/contacto" },
] as const;

const SERVICE_TITLES = ["Branding", "Motion", "Fotografía"] as const;

export default function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const onProject = /^\/proyecto\/\d+/.test(pathname);
  const [servicesOpen, setServicesOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!servicesOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setServicesOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
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

    const navigate = () => {
      const id = Number(match[1]);
      document.body.style.background = `#000 url("${coverUrl(id)}") center / cover no-repeat`;
      router.push("/");
    };

    // Si estamos scrolleados hacia abajo dentro del proyecto, primero subimos
    // con scroll suave hasta arriba (donde está el hero) y SOLO entonces
    // lanzamos la animación de cierre hacia la espiral => relevo sin salto.
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      setServicesOpen((open) => !open);
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
            <ArrowLeft size={16} strokeWidth={2.25} />
            Volver a todos los proyectos
          </button>
        </div>
        <ul className="nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
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
        id="nav-services-submenu"
        className="nav-submenu"
        hidden={!servicesOpen}
        aria-hidden={!servicesOpen}
      >
        <ul className="nav-submenu-list">
          {SERVICE_TITLES.map((title) => (
            <li key={title}>
              <span className="nav-submenu-title">{title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
