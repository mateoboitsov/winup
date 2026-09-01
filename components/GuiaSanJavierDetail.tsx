"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import TransitionLink from "@/components/TransitionLink";
import {
  GUIA_DIVES,
  GUIA_HERO_IMAGE,
  GUIA_MARQUEE,
  GUIA_PAGES,
  GUIA_SPREAD_INDICES,
  GUIA_STEPS,
} from "@/lib/guiaSanJavier";
import { assetUrl, coverUrl, getNextProject, type Project } from "@/lib/projects";
import styles from "@/components/GuiaSanJavierDetail.module.css";

export default function GuiaSanJavierDetail({ project }: { project: Project }) {
  const nextProject = getNextProject(project.id);
  const [dive, setDive] = useState(0);
  const [step, setStep] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [spreadActive, setSpreadActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const spreadTrackRef = useRef<HTMLDivElement>(null);

  const activeDive = GUIA_DIVES[dive]!;
  const activeStep = GUIA_STEPS[step]!;

  const shiftLightbox = useCallback((delta: number) => {
    setLightbox((current) => {
      if (current === null) return null;
      const n = GUIA_PAGES.length;
      return ((current + delta) % n + n) % n;
    });
  }, []);

  useEffect(() => {
    document.body.style.background = "var(--bg-soft)";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.background = "";
    };
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealVisible);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    root.querySelectorAll(`.${styles.reveal}`).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") shiftLightbox(1);
      if (e.key === "ArrowLeft") shiftLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, shiftLightbox]);

  const spreads = GUIA_SPREAD_INDICES.map((i) => GUIA_PAGES[i]!);

  const scrollSpreadToIndex = useCallback((index: number) => {
    const track = spreadTrackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
      behavior: "smooth",
    });
  }, []);

  const goSpread = (dir: -1 | 1) => {
    const next = Math.min(spreads.length - 1, Math.max(0, spreadActive + dir));
    setSpreadActive(next);
    scrollSpreadToIndex(next);
  };

  useEffect(() => {
    const track = spreadTrackRef.current;
    if (!track) return;

    const onScroll = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(track.children).forEach((child, i) => {
        const el = child as HTMLElement;
        const mid = el.offsetLeft + el.clientWidth / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setSpreadActive(best);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [spreads.length]);

  return (
    <div
      ref={containerRef}
      className={`project-detail ${styles.root}`}
      data-page="project"
      data-experience="guia-san-javier"
    >
      <section
        className="project-hero"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <img
          data-hero
          className={styles.heroImage}
          src={assetUrl(GUIA_HERO_IMAGE)}
          alt={project.title}
          decoding="sync"
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
        <div className={styles.heroContent}>
          <div className="content-width">
            <p className="ui-label" style={{ color: "var(--accent)", marginBottom: "0.75rem" }}>
              {project.category} · {project.year}
            </p>
            <h1
              className="project-hero-title"
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
            <p className={styles.heroNote}>
              65 páginas · 7 inmersiones · diseño y edición completa
            </p>
          </div>
        </div>
      </section>

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

      <section className="manifesto service-manifesto">
        <div className="manifesto-grid">
          <p className="manifesto-label ui-label">{project.label}</p>
          <div>
            <p
              className="manifesto-body service-manifesto-body"
              style={{ userSelect: "text", whiteSpace: "pre-line" }}
            >
              {project.statement}
            </p>
          </div>
        </div>
      </section>

      <p className={styles.diveIndex} aria-hidden>
        {GUIA_MARQUEE.join(" · ")}
      </p>

      <section className="project-photos" aria-label="El sistema editorial">
        <div className="project-carousel-header-bar">
          <div className="content-width project-photos-header">
            <p className="ui-label" style={{ color: "var(--accent)" }}>
              El sistema editorial
            </p>
            {spreads.length > 1 && (
              <div className="project-photos-controls">
                <button
                  type="button"
                  className="project-photos-nav"
                  onClick={() => goSpread(-1)}
                  disabled={spreadActive === 0}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={18} strokeWidth={2.25} />
                </button>
                <button
                  type="button"
                  className="project-photos-nav"
                  onClick={() => goSpread(1)}
                  disabled={spreadActive === spreads.length - 1}
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={18} strokeWidth={2.25} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div
          ref={spreadTrackRef}
          className={`project-photos-track ${styles.spreadTrack}`}
          data-few={spreads.length <= 2}
        >
          {spreads.map((page, i) => {
            const pageIndex = GUIA_SPREAD_INDICES[i]!;
            return (
              <button
                key={page.src}
                type="button"
                className={`project-photo-slide ${styles.spreadSlide}`}
                data-active={i === spreadActive}
                onClick={() => setLightbox(pageIndex)}
              >
                <figure className={styles.spreadFigure}>
                  <img src={assetUrl(page.src)} alt={page.label} loading="lazy" />
                  <figcaption>{page.label}</figcaption>
                </figure>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.block} aria-label="Las 7 inmersiones">
        <div className="content-width">
          <p className="ui-label" style={{ color: "var(--accent)", marginBottom: "1.25rem" }}>
            Las 7 inmersiones
          </p>
          <div className={styles.chips}>
            {GUIA_DIVES.map((d, i) => (
              <button
                key={d.name}
                type="button"
                className={`${styles.chip} ${i === dive ? styles.chipActive : ""}`}
                onClick={() => setDive(i)}
              >
                <span className={styles.chipNum}>{d.num}</span>
                <span>{d.name}</span>
              </button>
            ))}
          </div>
          <div className={styles.diveGrid}>
            <div>
              <p className={`ui-label ${styles.diveKicker}`}>{activeDive.kicker}</p>
              <h2 className={styles.diveName}>{activeDive.name}</h2>
              <p className={styles.diveBody}>{activeDive.body}</p>
              <dl className={styles.diveStats}>
                <div>
                  <dt>Profundidad</dt>
                  <dd>{activeDive.depth}</dd>
                </div>
                <div>
                  <dt>Nivel</dt>
                  <dd>{activeDive.level}</dd>
                </div>
                <div>
                  <dt>Páginas</dt>
                  <dd>{activeDive.pages}</dd>
                </div>
              </dl>
            </div>
            <div className={styles.diveImages}>
              {activeDive.imageIndices.map((pageIndex) => {
                const page = GUIA_PAGES[pageIndex]!;
                return (
                  <button
                    key={page.src}
                    type="button"
                    className={styles.diveImageBtn}
                    onClick={() => setLightbox(pageIndex)}
                  >
                    <img src={assetUrl(page.src)} alt={page.label} loading="lazy" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.block} aria-label="Proceso">
        <div className="content-width">
          <p className="ui-label" style={{ color: "var(--accent)", marginBottom: "1.25rem" }}>
            Cómo hicimos la guía
          </p>
          <div className={styles.stepsGrid}>
            <div>
              {GUIA_STEPS.map((s, i) => (
                <button
                  key={s.num}
                  type="button"
                  className={`${styles.stepBtn} ${i === step ? styles.stepBtnActive : ""}`}
                  onClick={() => setStep(i)}
                >
                  <span className={styles.stepNum}>{s.num}</span>
                  <span className={styles.stepTitle}>{s.title}</span>
                </button>
              ))}
              <p className={styles.stepBody}>{activeStep.body}</p>
            </div>
            <button
              type="button"
              className={styles.stepImageBtn}
              onClick={() => setLightbox(activeStep.imageIndex)}
            >
              <img
                src={assetUrl(GUIA_PAGES[activeStep.imageIndex]!.src)}
                alt={GUIA_PAGES[activeStep.imageIndex]!.label}
                loading="lazy"
              />
            </button>
          </div>
        </div>
      </section>

      <section
        className="project-next-section"
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
          <TransitionLink href={`/proyecto/${nextProject.id}`} className="next-project-btn">
            Siguiente proyecto
            <ArrowRight size={16} strokeWidth={2.5} />
          </TransitionLink>
        </div>
      </section>

      <SiteFooter />

      {lightbox !== null && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal
          aria-label="Vista ampliada"
          onClick={() => setLightbox(null)}
        >
          <div className={styles.lightboxHead}>
            <span>{GUIA_PAGES[lightbox]!.label}</span>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightbox(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <div className={styles.lightboxBody} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxNav}
              onClick={() => shiftLightbox(-1)}
              aria-label="Anterior"
            >
              ←
            </button>
            <img
              className={styles.lightboxImg}
              src={assetUrl(GUIA_PAGES[lightbox]!.src)}
              alt={GUIA_PAGES[lightbox]!.label}
            />
            <button
              type="button"
              className={styles.lightboxNav}
              onClick={() => shiftLightbox(1)}
              aria-label="Siguiente"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
