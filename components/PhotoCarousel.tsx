"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { assetUrl } from "@/lib/projects";

type Props = {
  images: string[];
  label?: string;
};

export default function PhotoCarousel({
  images = [],
  label = "Galería",
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
      behavior: "smooth",
    });
  }, []);

  const go = (dir: -1 | 1) => {
    const next = Math.min(images.length - 1, Math.max(0, active + dir));
    setActive(next);
    scrollToIndex(next);
  };

  useEffect(() => {
    const track = trackRef.current;
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
      setActive(best);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <section className="project-photos" aria-label={label}>
      <div className="project-carousel-header-bar">
        <div className="content-width project-photos-header">
          <p className="ui-label" style={{ color: "var(--accent)" }}>
            {label}
          </p>
          {images.length > 1 && (
            <div className="project-photos-controls">
            <button
              type="button"
              className="project-photos-nav"
              onClick={() => go(-1)}
              disabled={active === 0}
              aria-label="Anterior"
            >
              <ChevronLeft size={18} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              className="project-photos-nav"
              onClick={() => go(1)}
              disabled={active === images.length - 1}
              aria-label="Siguiente"
            >
              <ChevronRight size={18} strokeWidth={2.25} />
            </button>
          </div>
        )}
        </div>
      </div>

      <div
        ref={trackRef}
        className="project-photos-track"
        data-few={images.length <= 2}
      >
        {images.map((src, i) => (
          <figure
            key={src}
            className="project-photo-slide"
            data-active={i === active}
          >
            <div className="project-photo-frame">
              <img
                className="project-photo-img"
                src={assetUrl(src)}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </figure>
        ))}
      </div>

      {images.length > 1 && (
        <div className="project-photos-dots" role="tablist" aria-label={label}>
          {images.map((src, i) => (
            <button
              key={`${src}-dot`}
              type="button"
              role="tab"
              aria-selected={i === active}
              className="project-photos-dot"
              onClick={() => {
                setActive(i);
                scrollToIndex(i);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
