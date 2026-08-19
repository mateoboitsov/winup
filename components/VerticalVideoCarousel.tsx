"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { assetUrl, type ProjectVideo } from "@/lib/projects";
import VideoPlayerModal from "@/components/VideoPlayerModal";

export type ReelItem =
  | (ProjectVideo & { kind: "video" })
  | { kind: "image"; src: string; caption?: string }
  | { kind: "placeholder"; id: string; caption?: string };

type Props = {
  items: ReelItem[];
  label?: string;
  variant?: "default" | "cinematic";
  modalTitle?: string;
};

function reelKey(item: ReelItem) {
  if (item.kind === "placeholder") return item.id;
  return `${item.kind}-${item.src}`;
}

function CarouselHeader({
  label,
  showControls,
  onPrev,
  onNext,
  active,
  total,
}: {
  label: string;
  showControls: boolean;
  onPrev: () => void;
  onNext: () => void;
  active: number;
  total: number;
}) {
  return (
    <div className="project-carousel-header-bar">
      <div className="content-width project-reels-header">
        <p className="ui-label" style={{ color: "var(--accent)" }}>
          {label}
        </p>
        {showControls && total > 1 && (
          <div className="project-reels-controls">
            <button
              type="button"
              className="project-reels-nav"
              onClick={onPrev}
              disabled={active === 0}
              aria-label="Anterior"
            >
              <ChevronLeft size={18} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              className="project-reels-nav"
              onClick={onNext}
              disabled={active === total - 1}
              aria-label="Siguiente"
            >
              <ChevronRight size={18} strokeWidth={2.25} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerticalVideoCarousel({
  items = [],
  label = "Vídeos",
  variant = "default",
  modalTitle,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const singleRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const singleVideo =
    items.length === 1 && items[0]?.kind === "video" ? items[0] : null;
  const modalItem = modalIndex !== null ? items[modalIndex] : null;
  const carouselModalOpen = modalIndex !== null && modalItem?.kind === "video";
  const playbackTitle = modalTitle ?? label;

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
    if (singleVideo) return;
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
  }, [singleVideo]);

  useEffect(() => {
    const target = singleVideo ? singleRef.current : trackRef.current;
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.35 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [singleVideo]);

  useEffect(() => {
    if (singleVideo) return;
    videoRefs.current.forEach((video) => {
      if (!video) return;
      if (video.readyState === 0) video.load();
    });
  }, [items, singleVideo]);

  useEffect(() => {
    if (singleVideo) {
      const video = previewRef.current;
      if (!video) return;
      if (modalOpen) {
        video.pause();
      } else if (inView) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
      return;
    }

    if (modalOpen || carouselModalOpen) {
      videoRefs.current.forEach((video) => video?.pause());
      return;
    }

    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      video.muted = true;
      if (inView && i === active) {
        void video.play().catch(() => {});
      } else {
        video.pause();
        if (video.readyState >= 1) {
          video.currentTime = 0;
        }
      }
    });
  }, [active, items, inView, singleVideo, modalOpen, carouselModalOpen]);

  if (items.length === 0) return null;

  if (singleVideo) {
    return (
      <section
        className={`project-reels is-single-video${variant === "cinematic" ? " is-cinematic" : ""}`}
        aria-label={label}
      >
        <div ref={singleRef} className="project-reels-single">
          <figure className="project-reel-slide project-reel-slide--solo" data-active="true">
            <div className="project-reel-frame">
              <video
                ref={previewRef}
                className="project-reel-video"
                src={assetUrl(singleVideo.src)}
                poster={
                  singleVideo.poster ? assetUrl(singleVideo.poster) : undefined
                }
                playsInline
                loop
                muted
                preload="auto"
                controls={false}
                disablePictureInPicture
                tabIndex={-1}
              />
              <button
                type="button"
                className="project-reel-play is-visible"
                onClick={() => setModalOpen(true)}
                aria-label={`Reproducir ${playbackTitle}`}
              >
                <span className="project-reel-play-icon" aria-hidden="true">
                  <span className="project-reel-play-ring" aria-hidden="true" />
                  <Play size={28} strokeWidth={2} fill="currentColor" />
                </span>
              </button>
            </div>
            {singleVideo.caption && (
              <figcaption className="project-reel-caption">
                {singleVideo.caption}
              </figcaption>
            )}
          </figure>
        </div>

        <VideoPlayerModal
          open={modalOpen}
          src={singleVideo.src}
          poster={singleVideo.poster}
          title={playbackTitle}
          onClose={() => setModalOpen(false)}
        />
      </section>
    );
  }

  return (
    <section
      className={`project-reels${variant === "cinematic" ? " is-cinematic" : ""}`}
      aria-label={label}
    >
      <CarouselHeader
        label={label}
        showControls
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        active={active}
        total={items.length}
      />

      <div ref={trackRef} className="project-reels-track">
        {items.map((item, i) => (
          <figure
            key={reelKey(item)}
            className="project-reel-slide"
            data-active={i === active}
          >
            <div className="project-reel-frame">
              {item.kind === "video" ? (
                <>
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    className="project-reel-video"
                    src={assetUrl(item.src)}
                    poster={item.poster ? assetUrl(item.poster) : undefined}
                    playsInline
                    loop
                    muted
                    preload="metadata"
                    controls={false}
                    disablePictureInPicture
                    tabIndex={-1}
                  />
                  <button
                    type="button"
                    className="project-reel-play is-visible"
                    onClick={() => setModalIndex(i)}
                    aria-label={`Reproducir ${playbackTitle}`}
                  >
                    <span className="project-reel-play-icon" aria-hidden="true">
                      <span className="project-reel-play-ring" aria-hidden="true" />
                      <Play size={28} strokeWidth={2} fill="currentColor" />
                    </span>
                  </button>
                </>
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

      {carouselModalOpen && modalItem?.kind === "video" && (
        <VideoPlayerModal
          open
          src={modalItem.src}
          poster={modalItem.poster}
          title={playbackTitle}
          onClose={() => setModalIndex(null)}
        />
      )}
    </section>
  );
}
