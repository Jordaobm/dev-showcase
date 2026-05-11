"use client";

import { useRef, useState } from "react";

const SEEK_STEP_SECONDS = 5;

export const useSeekablePlayer = <T extends HTMLMediaElement>() => {
  const mediaRef = useRef<T | null>(null);
  const rafRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const startRAF = () => {
    const tick = () => {
      if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopRAF = () => cancelAnimationFrame(rafRef.current);

  const resetPlayback = () => {
    stopRAF();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (playing) {
      mediaRef.current.pause();
      stopRAF();
    } else {
      mediaRef.current.play();
      startRAF();
    }
    setPlaying((prev) => !prev);
  };

  const handleLoadedMetadata = () => {
    if (!mediaRef.current) return;
    const d = mediaRef.current.duration;
    if (Number.isFinite(d)) setDuration(d);
  };

  const handleEnded = () => {
    stopRAF();
    setPlaying(false);
    setCurrentTime(mediaRef.current?.currentTime ?? 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mediaRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const next = ratio * duration;
    mediaRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const handleSeekKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!mediaRef.current || !duration) return;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      next = Math.min(
        duration,
        mediaRef.current.currentTime + SEEK_STEP_SECONDS,
      );
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      next = Math.max(0, mediaRef.current.currentTime - SEEK_STEP_SECONDS);
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = duration;
    }
    if (next === null) return;
    e.preventDefault();
    mediaRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds) || !Number.isFinite(seconds))
      return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return {
    mediaRef,
    playing,
    currentTime,
    duration,
    progressPercent,
    resetPlayback,
    togglePlay,
    handleLoadedMetadata,
    handleEnded,
    handleSeek,
    handleSeekKeyDown,
    formatTime,
  };
};
