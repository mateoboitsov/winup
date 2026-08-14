"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { assetUrl, type ProjectVideo } from "@/lib/projects";

export type ReelItem =
  | (ProjectVideo & { kind: "video" })
  | { kind: "image"; src: string; caption?: string }
  | { kind: "placeholder"; id: string; caption?: string };

type Props = {
  items: ReelItem[];
  label?: string;
};

function reelKey(item: ReelItem) {
  if (item.kind === "placeholder") return item.id;
  return `${item.kind}-${item.src}`;
}

export default function VerticalVideoCarousel({
  items = [],
  label = "Vídeos",
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);

  const [inView, setInView] = useState(false);

  const hasVideo = items.some((item) => item.kind === "video");

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
    const next = Math.min(items.length - 1, Math.max(0, active + dir));
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
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.35 }
    );
    io.observe(track);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      video.muted = muted;
      if (inView && i === active) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active, muted, items, inView]);

  if (items.length === 0) return null;

  return (
    <section className="project-reels" aria-label={label}>
      <div className="content-width project-reels-header">
        <p className="ui-label" style={{ color: "var(--accent)" }}>
          {label}
        </p>
        <div className="project-reels-controls">
          {hasVideo && (
            <button
              type="button"
              className="project-reels-mute"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Activar sonido" : "Silenciar"}
            >
              {muted ? (
                <VolumeX size={16} strokeWidth={2.25} />
              ) : (
                <Volume2 size={16} strokeWidth={2.25} />
              )}
            </button>
          )}
          {items.length > 1 && (
            <>
              <button
                type="button"
                className="project-reels-nav"
                onClick={() => go(-1)}
                disabled={active === 0}
                aria-label="Anterior"
              >
                <ChevronLeft size={18} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                className="project-reels-nav"
                onClick={() => go(1)}
                disabled={active === items.length - 1}
                aria-label="Siguiente"
              >
                <ChevronRight size={18} strokeWidth={2.25} />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={trackRef}
        className="project-reels-track"
        data-few={items.length === 1}
      >
        {items.map((item, i) => (
          <figure
            key={reelKey(item)}
            className="project-reel-slide"
            data-active={i === active}
          >
            <div className="project-reel-frame">
              {item.kind === "video" ? (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  className="project-reel-video"
                  src={assetUrl(item.src)}
                  poster={item.poster ? assetUrl(item.poster) : undefined}
                  playsInline
                  loop
                  muted={muted}
                  preload="none"
                  controls={false}
                  disablePictureInPicture
                  tabIndex={-1}
                />
              ) : item.kind === "image" ? (
                <img
                  className="project-reel-video"
                  src={assetUrl(item.src)}
                  alt={item.caption ?? ""}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="project-reel-placeholder" aria-label="Vídeo pendiente">
                  <span>Vídeo</span>
                </div>
              )}
            </div>
            {item.caption && (
              <figcaption className="project-reel-caption">{item.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>

      {items.length > 1 && (
        <div className="project-reels-dots" role="tablist" aria-label={label}>
          {items.map((item, i) => (
            <button
              key={`${reelKey(item)}-dot`}
              type="button"
              role="tab"
              aria-selected={i === active}
              className="project-reels-dot"
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
