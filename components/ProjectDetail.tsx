"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { getNextProject, coverUrl, assetUrl, type Project } from "@/lib/projects";
import { transition } from "@/lib/transition";
import SiteFooter from "@/components/SiteFooter";
import VerticalVideoCarousel, { type ReelItem } from "@/components/VerticalVideoCarousel";

gsap.registerPlugin(useGSAP);

const MIN_GALLERY_IMAGES = 8;
const MIN_REEL_VIDEOS = 3;

type GallerySlot =
  | { kind: "image"; src: string }
  | { kind: "placeholder"; id: string };

function padGallery(images: string[], min = MIN_GALLERY_IMAGES): GallerySlot[] {
  const slots: GallerySlot[] = images.map((src) => ({ kind: "image", src }));
  let n = 0;
  while (slots.length < min) {
    n += 1;
    slots.push({ kind: "placeholder", id: `img-ph-${n}` });
  }
  return slots;
}

function padReels(videos: Project["videos"], min = MIN_REEL_VIDEOS): ReelItem[] {
  const items: ReelItem[] = (videos ?? []).map((v) => ({
    ...v,
    kind: "video" as const,
  }));
  let n = 0;
  while (items.length < min) {
    n += 1;
    items.push({
      kind: "placeholder",
      id: `vid-ph-${n}`,
      caption: "Vídeo",
    });
  }
  return items;
}

function galleryRows(slots: GallerySlot[]) {
  const rows: { slot: GallerySlot; variant: "wide" | "tall" | "default" }[][] = [];
  let i = 0;
  if (slots[0]) {
    rows.push([{ slot: slots[0], variant: "wide" }]);
    i = 1;
  }
  while (i < slots.length) {
    const a = slots[i]!;
    const b = slots[i + 1];
    if (b) {
      rows.push([
        { slot: a, variant: "tall" },
        { slot: b, variant: "tall" },
      ]);
      i += 2;
    } else {
      rows.push([{ slot: a, variant: "default" }]);
      i += 1;
    }
  }
  return rows;
}

function GalleryMedia({
  slot,
  variant,
}: {
  slot: GallerySlot;
  variant: "wide" | "tall" | "default";
}) {
  if (slot.kind === "placeholder") {
    return (
      <div
        className={`img-placeholder ${variant} is-empty-placeholder`}
        aria-label="Imagen pendiente"
      >
        <span>Imagen</span>
      </div>
    );
  }

  return (
    <img
      className={`img-placeholder ${variant}`}
      src={assetUrl(slot.src)}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

function GalleryBlock({ slots }: { slots: GallerySlot[] }) {
  if (slots.length === 0) return null;
  return (
    <section className="project-gallery">
      <div className="gallery">
        {galleryRows(slots).map((row, ri) =>
          row.length === 2 ? (
            <div className="gallery-row" key={`row-${ri}`}>
              {row.map((item) => (
                <GalleryMedia
                  key={item.slot.kind === "image" ? item.slot.src : item.slot.id}
                  slot={item.slot}
                  variant={item.variant}
                />
              ))}
            </div>
          ) : (
            <GalleryMedia
              key={row[0]!.slot.kind === "image" ? row[0]!.slot.src : row[0]!.slot.id}
              slot={row[0]!.slot}
              variant={row[0]!.variant}
            />
          )
        )}
      </div>
    </section>
  );
}

export default function ProjectDetail({ project }: { project: Project }) {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const nextProject = getNextProject(project.id);

  const sections = project.sections ?? [];
  const gallerySlots = padGallery(project.images);
  const splitAt = Math.max(Math.ceil(gallerySlots.length / 2), 3);
  const firstGallery = gallerySlots.slice(0, splitAt);
  const restGallery = gallerySlots.slice(splitAt);
  const reelItems = padReels(project.videos);

  const goToNextProject = () => {
    const img = previewRef.current;
    const url = `/proyecto/${nextProject.id}`;
    if (!img) {
      router.push(url);
      return;
    }

    const rect = img.getBoundingClientRect();
    const clone = document.createElement("img");
    clone.setAttribute("data-next-project-clone", "true");
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
      borderRadius: "0px",
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
        if (transition.active) {
          transition.virtIdx += 1;
          transition.scroll += 1;
          transition.projectId = nextProject.id;
        }
        router.push(url);
        const nextSrc = coverUrl(nextProject.id);
        let tries = 0;
        const removeWhenReady = () => {
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
      gsap.set(".reveal", { opacity: 0, y: 20 });
      gsap.set(".hero-gradient-fade", { opacity: 0 });

      let cancelled = false;
      const waitAndPlayEnter = () => {
        if (cancelled) return;
        const activeClone = document.querySelector('[data-next-project-clone="true"]');
        if (activeClone) {
          requestAnimationFrame(waitAndPlayEnter);
          return;
        }

        gsap.to(".reveal", {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.15,
        });

        gsap.to(".hero-gradient-fade", {
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          delay: 0.1,
        });
      };
      waitAndPlayEnter();

      return () => {
        cancelled = true;
      };
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
        background: "var(--bg-soft)",
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
          className="hero-gradient-fade"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.2) 42%, transparent 70%)",
            pointerEvents: "none",
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
            <p
              className="reveal ui-label"
              style={{ color: "var(--accent)", marginBottom: "0.75rem" }}
            >
              {project.category} · {project.year}
            </p>
            <h1
              className="reveal project-hero-title"
              style={{
                fontSize: "clamp(3.5rem, 10vw, 8rem)",
                fontWeight: 800,
                lineHeight: 1.02,
                color: "#fff",
                textAlign: "left",
                maxWidth: "14ch",
              }}
            >
              {project.title}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Meta ─────────────────────────────────────────────────────── */}
      {(project.client || (project.deliverables && project.deliverables.length > 0)) && (
        <section className="project-meta">
          <div className="content-width project-meta-grid">
            {project.client && (
              <div className="project-meta-item">
                <p className="ui-label project-meta-label">Cliente</p>
                <p className="project-meta-value">{project.client}</p>
              </div>
            )}
            <div className="project-meta-item">
              <p className="ui-label project-meta-label">Año</p>
              <p className="project-meta-value">{project.year}</p>
            </div>
            <div className="project-meta-item">
              <p className="ui-label project-meta-label">Categoría</p>
              <p className="project-meta-value">{project.category}</p>
            </div>
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="project-meta-item project-meta-deliverables">
                <p className="ui-label project-meta-label">Alcance</p>
                <p className="project-meta-value">{project.deliverables.join(" · ")}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Manifiesto ───────────────────────────────────────────────── */}
      <section className="manifesto service-manifesto">
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
          <div>
            <p className="manifesto-body service-manifesto-body" style={{ userSelect: "text", whiteSpace: "pre-line" }}>
              {project.statement}
            </p>
          </div>
        </div>
      </section>

      {/* ── Galería (primera mitad) ──────────────────────────────────── */}
      <GalleryBlock slots={firstGallery} />

      {/* ── Sección de texto 1 ───────────────────────────────────────── */}
      {sections[0] && (
        <section className="project-section">
          <div className="content-width project-section-grid">
            <p className="ui-label project-section-label">{sections[0].title}</p>
            <p className="project-section-body">{sections[0].body}</p>
          </div>
        </section>
      )}

      {/* ── Carrusel vertical ────────────────────────────────────────── */}
      <VerticalVideoCarousel items={reelItems} label="Vídeos" />

      {/* ── Sección de texto 2+ ──────────────────────────────────────── */}
      {sections.slice(1).map((section) => (
        <section key={section.title} className="project-section">
          <div className="content-width project-section-grid">
            <p className="ui-label project-section-label">{section.title}</p>
            <p className="project-section-body">{section.body}</p>
          </div>
        </section>
      ))}

      {/* ── Galería (resto) ──────────────────────────────────────────── */}
      <GalleryBlock slots={restGallery} />

      {/* ── Siguiente proyecto ───────────────────────────────────────── */}
      <section
        style={{
          background: "var(--bg-soft)",
          borderTop: "1px solid rgba(200,255,0,0.2)",
          padding: "clamp(4.5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 4.5rem)",
        }}
      >
        <div className="next-project">
          <p className="ui-label" style={{ color: "var(--accent)" }}>
            Siguiente
          </p>
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
              color: "#fff",
            }}
          >
            {nextProject.title}
          </h2>
          <button type="button" className="next-project-btn" onClick={goToNextProject}>
            Siguiente proyecto
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
