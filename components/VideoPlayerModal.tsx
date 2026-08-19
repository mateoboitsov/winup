"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { assetUrl } from "@/lib/projects";

type Props = {
  open: boolean;
  src: string;
  poster?: string;
  title?: string;
  onClose: () => void;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayerModal({
  open,
  src,
  poster,
  title,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoplayStarted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || !open || !video.paused || autoplayStarted.current) return;

    video.currentTime = 0;
    video.muted = true;

    void video
      .play()
      .then(() => {
        autoplayStarted.current = true;
        setPlaying(true);
        video.muted = false;
        setMuted(false);
      })
      .catch(() => setPlaying(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, togglePlay]);

  useEffect(() => {
    if (!open) {
      autoplayStarted.current = false;
      setPlaying(false);
      setCurrent(0);
      setMuted(false);
      return;
    }

    autoplayStarted.current = false;
    startPlayback();
  }, [open, src, startPlayback]);

  const handleVideoReady = useCallback(() => {
    if (!open) return;
    startPlayback();
  }, [open, startPlayback]);

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = (value / 100) * duration;
    setCurrent(video.currentTime);
  };

  if (!mounted || !open) return null;

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return createPortal(
    <div
      className="video-modal"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Reproducir ${title}` : "Reproductor de vídeo"}
      onClick={onClose}
    >
      <div className="video-modal-close-shade" aria-hidden="true" />

      <button
        type="button"
        className="video-modal-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
      >
        <X size={28} strokeWidth={2} />
      </button>

      <div className="video-modal-inner" onClick={(e) => e.stopPropagation()}>
        <video
          ref={videoRef}
          key={src}
          className="video-modal-video"
          src={assetUrl(src)}
          poster={poster ? assetUrl(poster) : undefined}
          playsInline
          preload="auto"
          onLoadedData={handleVideoReady}
          onCanPlay={handleVideoReady}
          onTimeUpdate={() => setCurrent(videoRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onClick={togglePlay}
        />

        <div className="video-modal-controls">
          <button
            type="button"
            className="video-modal-btn"
            onClick={togglePlay}
            aria-label={playing ? "Pausar" : "Reproducir"}
          >
            {playing ? (
              <Pause size={18} strokeWidth={2.25} />
            ) : (
              <Play size={18} strokeWidth={2.25} />
            )}
          </button>

          <span className="video-modal-time">{formatTime(current)}</span>

          <input
            type="range"
            className="video-modal-progress"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            style={{ ["--progress" as string]: `${progress}%` }}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Progreso"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />

          <span className="video-modal-time">{formatTime(duration)}</span>

          <button
            type="button"
            className="video-modal-btn"
            onClick={() => {
              const video = videoRef.current;
              if (!video) return;
              video.muted = !video.muted;
              setMuted(video.muted);
            }}
            aria-label={muted ? "Activar sonido" : "Silenciar"}
          >
            {muted ? (
              <VolumeX size={18} strokeWidth={2.25} />
            ) : (
              <Volume2 size={18} strokeWidth={2.25} />
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
