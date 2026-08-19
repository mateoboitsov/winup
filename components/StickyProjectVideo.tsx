"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import { assetUrl, coverUrl } from "@/lib/projects";
import VideoPlayerModal from "@/components/VideoPlayerModal";

type Props = {
  projectId: number;
  videoSrc: string;
  title: string;
  children: ReactNode;
};

export default function StickyProjectVideo({
  projectId,
  videoSrc,
  title,
  children,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [pinned, setPinned] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const last =
      root?.querySelector<HTMLElement>(".video-sticky-last") ??
      root?.querySelector<HTMLElement>(".video-sticky-block:last-of-type");
    if (!root || !last) return;

    const update = () => {
      const rootRect = root.getBoundingClientRect();
      const lastTop = last.getBoundingClientRect().top;
      const trigger = window.innerHeight * 0.85;
      const inStickyZone =
        lastTop > trigger &&
        rootRect.bottom > 0 &&
        rootRect.top < window.innerHeight;
      setPinned(inStickyZone);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [children]);

  useEffect(() => {
    const video = previewRef.current;
    if (!video || modalOpen) return;
    void video.play().catch(() => {});
  }, [modalOpen, videoSrc]);

  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;
    if (modalOpen) {
      video.pause();
    } else if (pinned) {
      void video.play().catch(() => {});
    }
  }, [modalOpen, pinned]);

  return (
    <>
      <div ref={rootRef} className="video-sticky-root">
        <div
          className={`video-sticky-panel${pinned ? " is-pinned" : ""}`}
          aria-hidden={!pinned}
        >
          <video
            ref={previewRef}
            className="video-sticky-preview"
            src={assetUrl(videoSrc)}
            poster={coverUrl(projectId)}
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
          />
          <div className="video-sticky-vignette" aria-hidden="true" />
          <div className="project-hero-video-grain" aria-hidden="true" />
        </div>

        <button
          type="button"
          className={`video-sticky-play${pinned && !modalOpen ? " is-visible" : ""}`}
          onClick={() => setModalOpen(true)}
          aria-label={`Reproducir ${title}`}
          aria-hidden={!pinned || modalOpen}
          tabIndex={pinned && !modalOpen ? 0 : -1}
        >
          <span className="video-sticky-play-ring" aria-hidden="true" />
          <Play size={28} strokeWidth={2} fill="currentColor" />
        </button>

        <div className="video-sticky-content">{children}</div>
      </div>

      <VideoPlayerModal
        open={modalOpen}
        src={videoSrc}
        poster={coverUrl(projectId)}
        title={title}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
