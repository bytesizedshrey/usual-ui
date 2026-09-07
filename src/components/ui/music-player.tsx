"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Pause, Play, Plus, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Music Player
 *
 * A collapsible, glassmorphic music player: a floating avatar peeks out of the
 * top-left, an animated equalizer pulses while audio plays, and a slim seekable
 * progress bar tracks position. The whole bar collapses to a compact pill,
 * hiding the track info and transport controls behind a soft width transition.
 *
 * Ported from the vanilla "Azuki Style Music Player" (CodeGrid) into a single,
 * self-contained, prop-driven React component. The Lottie sound-bars and
 * Ionicons of the original are replaced with a pure-CSS equalizer and
 * `lucide-react` icons, so the only runtime dependency is the icon set.
 */

export interface MusicTrack {
  /** Track title shown in the player. */
  title: string;
  /** Artist / author name shown under the title. */
  artist: string;
  /** URL of the audio file. Must be same-origin or CORS-enabled to stream. */
  src: string;
  /** Optional per-track artwork; falls back to the player `avatar`. */
  artwork?: string;
}

export interface MusicPlayerProps {
  /** Playlist to play through. The player renders nothing when empty. */
  tracks: MusicTrack[];
  /** Floating avatar image. Falls back to the current track's `artwork`. */
  avatar?: string;
  /** Index of the track to start on. Defaults to 0. */
  startIndex?: number;
  /** Begin playing as soon as the player mounts. Defaults to false. */
  autoPlay?: boolean;
  /** Wrap from the last track back to the first when a track ends. Defaults to true. */
  loop?: boolean;
  /** Render collapsed (compact pill) on first paint. Defaults to false. */
  defaultCollapsed?: boolean;
  /** Show the seekable progress bar along the bottom edge. Defaults to true. */
  showProgress?: boolean;
  /** Accent color for the equalizer and progress fill. Defaults to `currentColor`. */
  accentColor?: string;
  /** Called whenever the active track changes, with the track and its index. */
  onTrackChange?: (track: MusicTrack, index: number) => void;
  /** Extra class names for the root element. */
  className?: string;
}

const EQ_BARS = [0, 1, 2, 3];

/** Shared equalizer keyframes — identical across instances, so safe to repeat. */
const EQ_KEYFRAMES =
  "@keyframes vengeance-eq{0%,100%{transform:scaleY(0.28)}50%{transform:scaleY(1)}}";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
}

export function MusicPlayer({
  tracks,
  avatar,
  startIndex = 0,
  autoPlay = false,
  loop = true,
  defaultCollapsed = false,
  showProgress = true,
  onTrackChange,
  className,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(() => clampIndex(startIndex, tracks.length));
  const [isPlaying, setIsPlaying] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Whether the next loaded track should auto-start (true after a manual skip
  // or a natural track-end, so playback continues seamlessly).
  const shouldPlayRef = useRef(autoPlay);
  // Keep the latest callback without re-running the load effect on every render.
  const onTrackChangeRef = useRef(onTrackChange);
  useEffect(() => {
    onTrackChangeRef.current = onTrackChange;
  }, [onTrackChange]);

  const track = tracks[index];

  // Load the current track and (if flagged) begin playing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    audio.src = track.src;
    audio.load();
    setCurrentTime(0);
    onTrackChangeRef.current?.(track, index);

    if (shouldPlayRef.current) {
      audio.play().catch(() => {
        /* Autoplay can be blocked until the user interacts — ignore. */
      });
    }
    // Reload only when the source changes, not when the callback identity does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, track?.src]);

  const play = useCallback(() => {
    shouldPlayRef.current = true;
    audioRef.current?.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    shouldPlayRef.current = false;
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    if (tracks.length === 0) return;
    shouldPlayRef.current = true; // manual skips keep playing
    setIndex((i) => (i + 1) % tracks.length);
  }, [tracks.length]);

  const prev = useCallback(() => {
    if (tracks.length === 0) return;
    shouldPlayRef.current = true;
    setIndex((i) => (i - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  const handleEnded = useCallback(() => {
    if (!loop && index === tracks.length - 1) {
      shouldPlayRef.current = false;
      setIsPlaying(false);
      return;
    }
    next();
  }, [loop, index, tracks.length, next]);

  const seek = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(duration) || duration === 0) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = (event.clientX - rect.left) / rect.width;
      audio.currentTime = Math.min(Math.max(ratio, 0), 1) * duration;
    },
    [duration],
  );

  if (tracks.length === 0 || !track) return null;

  const artwork = avatar ?? track.artwork;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "relative select-none transition-[width] duration-700 ease-out",
        collapsed ? "w-[188px]" : "w-[min(420px,90vw)]",
        className,
      )}
    >
      <style>{EQ_KEYFRAMES}</style>

      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleEnded}
      />

      {/* Collapse / expand toggle (Raised Skeuomorphic Button) */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand player" : "Collapse player"}
        aria-expanded={!collapsed}
        className={cn(
          "absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-transform active:scale-[0.97]",
          "bg-gradient-to-b from-[#252525] to-[#1a1a1a] shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,0_4px_4px_-3px_#00000070]"
        )}
      >
        {collapsed ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
      </button>

      {/* Floating physical avatar module */}
      {artwork ? (
        <div className="absolute -top-4 left-0 z-20 flex h-[80px] w-[80px] items-center justify-center rounded-xl bg-[#080808] p-1.5 shadow-[0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset,0_6px_10px_-4px_#00000080]">
          <img
            src={artwork}
            alt={`${track.title} artwork`}
            className="h-full w-full rounded-lg object-cover grayscale opacity-80 contrast-125"
          />
        </div>
      ) : null}

      {/* Main Player Shell (Raised Material) */}
      <div className="relative flex h-[74px] items-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#202020] to-[#191919] pl-24 pr-4 shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,0_10px_10px_-9px_#00000070,0_20px_20px_-14px_#00000060,0_0px_6px_0px_#00000060]">
        
        {/* Equalizer (Inset Screen/Readout) */}
        <div className="mb-1 flex h-[28px] w-[32px] shrink-0 items-end justify-center gap-[3px] rounded bg-[#0a0a0a] p-1 shadow-[0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset]" aria-hidden="true">
          {EQ_BARS.map((bar) => (
            <span
              key={bar}
              className="block w-[3px] rounded-sm"
              style={{
                height: "100%",
                background: "#34d399",
                opacity: 0.8,
                transformOrigin: "bottom",
                animation: `vengeance-eq ${0.9 + bar * 0.18}s ease-in-out infinite`,
                animationPlayState: isPlaying ? "running" : "paused",
                transform: isPlaying ? undefined : "scaleY(0.28)",
              }}
            />
          ))}
        </div>

        {/* Track info + controls, hidden while collapsed */}
        <div
          className={cn(
            "mb-1 flex min-w-0 flex-1 items-center gap-3 pl-3 transition-opacity duration-300",
            collapsed ? "pointer-events-none opacity-0" : "opacity-100",
          )}
          style={{ transitionDelay: collapsed ? "0s" : "0.35s" }}
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold uppercase tracking-wider text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {track.title}
            </div>
            <div className="truncate text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/40 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {track.artist}
            </div>
          </div>

          {/* Hardware Playback Controls */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous track"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#282828] to-[#1e1e1e] text-white/60 shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,0_3px_4px_-2px_#00000070] transition-transform active:scale-[0.97]"
            >
              <SkipBack className="h-3.5 w-3.5 fill-current" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#202020] text-white/80 shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,0_4px_5px_-2px_#00000080] transition-transform active:scale-[0.97]"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next track"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#282828] to-[#1e1e1e] text-white/60 shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,0_3px_4px_-2px_#00000070] transition-transform active:scale-[0.97]"
            >
              <SkipForward className="h-3.5 w-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Seekable progress bar (Inset Track) */}
        {showProgress && !collapsed ? (
          <div
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration) || 0}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            tabIndex={0}
            onClick={seek}
            onKeyDown={(e) => {
              const audio = audioRef.current;
              if (!audio || !duration) return;
              if (e.key === "ArrowRight") audio.currentTime = Math.min(duration, currentTime + 5);
              if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, currentTime - 5);
            }}
            className="group absolute bottom-[10px] left-24 right-5 flex h-3 cursor-pointer items-center"
          >
            <div className="relative h-1 w-full rounded-full bg-[#0a0a0a] shadow-[0_0.5px_0_#ffffff50,0_2px_4px_#00000090_inset]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#34d399] opacity-80 shadow-[0_0_4px_#34d39940] transition-[width] duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MusicPlayer;
