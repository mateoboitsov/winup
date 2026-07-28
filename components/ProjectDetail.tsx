"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { getNextProject, coverUrl, type Project } from "@/lib/projects";
import { transition } from "@/lib/transition";

gsap.registerPlugin(useGSAP);

function galleryRows(images: string[]) {
  const rows: { src: string; variant: "wide" | "tall" | "default" }[][] = [];
  let i = 0;
  if (images[0]) {
    rows.push([{ src: images[0], variant: "wide" }]);
    i = 1;
  }
  while (i < images.length) {
    const a = images[i]!;
    const b = images[i + 1];
    if (b) {
      rows.push([
        { src: a, variant: "tall" },
        { src: b, variant: "tall" },
      ]);
      i += 2;
    } else {
      rows.push([{ src: a, variant: "default" }]);
      i += 1;
    }
  }
  return rows;
}

export default function ProjectDetail({ project }: { project: Project }) {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const nextProject = getNextProject(project.id);

  // Al pulsar "Siguiente proyecto": clonamos la imagen y la hacemos crecer
  // hasta ocupar toda la pantalla (mismo espíritu que el morph de la espiral),
  // y solo entonces navegamos. El clon queda por encima durante la navegación
  // (evita flash) y se retira cuando el detalle ya ha pintado.
  const goToNextProject = () => {
    const img = previewRef.current;
    const url = `/proyecto/${nextProject.id}`;
    if (!img) {
      router.push(url);
      return;
    }

    const rect = img.getBoundingClientRect();
    const clone = document.createElement("img");
    clone.src = coverUrl(nextProject.id);
    clone.decoding = "sync";
    clone.crossOrigin = "anonymous";
    Object.assign(clone.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      objectFit: "cover",
      objectPosition: "center",
      borderRadius: "16px",
      margin: "0",
      zIndex: "9999",
      pointerEvents: "none",
    });
    document.body.appendChild(clone);

    gsap.to(clone, {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0,
      duration: 0.7,
      ease: "power3.inOut",
      onComplete: () => {
        // Avanzamos el estado de transición al proyecto siguiente (uno más en
        // la secuencia de la espiral, mismo encuadre), para que al pulsar
        // "Volver" el morph de cierre salga DE ESTE proyecto y no del original.
        if (transition.active) {
          transition.virtIdx += 1;
          transition.scroll += 1;
          transition.projectId = nextProject.id;
        }
        router.push(url);
        // No retiramos el clon por número fijo de frames: la navegación de App
        // Router no es síncrona y a veces el hero destino aún no ha pintado =>
        // se colaba un frame de la página saliente. Esperamos a que el hero del
        // proyecto destino EXISTA y esté decodificado, y solo entonces lo
        // quitamos (con un tope de seguridad por si algo falla).
        const nextSrc = coverUrl(nextProject.id);
        let tries = 0;
        const removeWhenReady = () => {
          // Buscamos el HERO del proyecto DESTINO (por su URL). Importante usar
          // [data-hero]: la página saliente ya contiene la preview del proyecto
          // siguiente (mismo src) => sin este filtro dábamos por "listo" el
          // destino estando aún en la página anterior y se colaba su frame.
          const heroReady = Array.from(
            document.querySelectorAll<HTMLImageElement>('div[data-page="project"] img[data-hero]')
          ).some((el) => el.src === nextSrc && el.complete);
          if (heroReady || tries > 60) {
            requestAnimationFrame(() => clone.remove());
            return;
          }
          tries += 1;
          requestAnimationFrame(removeWhenReady);
        };
        requestAnimationFrame(removeWhenReady);
      },
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.background = "#000";
  }, [project.id]);

  useGSAP(
    () => {
      // La imagen ya llega a pantalla completa desde el morph 3D y debe quedar
      // QUIETA en el mismo encuadre (si la animáramos habría un salto al navegar).

      // Estado inicial oculto aplicado de forma SÍNCRONA (antes del primer
      // pintado) para que no haya un frame con todo visible (parpadeo/FOUC).
      gsap.set(".reveal", { opacity: 0, y: 20 });

      gsap.to(".reveal", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.15,
      });
    },
    { scope: container, dependencies: [project.id] }
  );

  return (
    <div
      ref={container}
      data-page="project"
      className="project-detail"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: "#1a1a1a",
        overflowX: "hidden",
      }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <img
          data-hero
          src={coverUrl(project.id)}
          crossOrigin="anonymous"
          decoding="sync"
          alt={project.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "clamp(2rem, 6vw, 5rem)",
            padding: "0 clamp(1.5rem, 5vw, 4.5rem)",
          }}
        >
          <div className="content-width">
            <h1
              className="reveal"
              style={{
                fontSize: "clamp(3.5rem, 10vw, 8rem)",
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: "-0.055em",
                color: "#fff",
                textAlign: "left",
              }}
            >
              {project.title}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Manifiesto ───────────────────────────────────────────────── */}
      <section
        className="manifesto"
        style={{
          position: "relative",
          background: "#1a1a1a",
          color: "#fff",
          padding: "clamp(4.5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 4.5rem)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="manifesto-grid">
          <p
            className="manifesto-label ui-label"
            style={{
              paddingTop: "0.35em",
              userSelect: "text",
            }}
          >
            {project.label}
          </p>
          <p
            className="manifesto-body"
            style={{
              fontSize: "clamp(1.55rem, 3.6vw, 3.15rem)",
              fontWeight: 400,
              lineHeight: 1.18,
              letterSpacing: "-0.05em",
              color: "#fff",
              userSelect: "text",
            }}
          >
            {project.statement}
          </p>
        </div>
      </section>

      {/* ── Galería ─────────────────────────────────────────────────── */}
      {project.images.length > 0 && (
        <section
          style={{
            background: "#1a1a1a",
            padding: "0 clamp(1.5rem, 5vw, 4.5rem) clamp(4.5rem, 12vw, 9rem)",
          }}
        >
          <div className="gallery">
            {galleryRows(project.images).map((row, ri) =>
              row.length === 2 ? (
                <div className="gallery-row" key={`row-${ri}`}>
                  {row.map((item) => (
                    <img
                      key={item.src}
                      className={`img-placeholder ${item.variant}`}
                      src={item.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </div>
              ) : (
                <img
                  key={row[0]!.src}
                  className={`img-placeholder ${row[0]!.variant}`}
                  src={row[0]!.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              )
            )}
          </div>
        </section>
      )}

      {/* ── Siguiente proyecto ───────────────────────────────────────── */}
      <section
        style={{
          background: "#1a1a1a",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "clamp(4.5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 4.5rem)",
        }}
      >
        <div className="next-project">
          <img
            ref={previewRef}
            className="next-project-preview"
            src={coverUrl(nextProject.id)}
            alt={nextProject.title}
            decoding="async"
          />
          <h2
            className="next-project-title"
            style={{
              fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.055em",
              color: "#fff",
            }}
          >
            {nextProject.title}
          </h2>
          <button type="button" className="next-project-btn" onClick={goToNextProject}>
            Siguiente proyecto
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
      </section>
    </div>
  );
}
