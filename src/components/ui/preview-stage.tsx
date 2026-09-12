"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Every card's preview gets the same reserved height, so the grid reads as
 * one uniform, premium component library instead of a stack of differently
 * sized canvases. Components are centered and scaled to fit inside it —
 * never stretched, never distorted, never cropped, never forced to share
 * an aspect ratio with their neighbors. Tall/detailed by design, this
 * height is chosen so densely-detailed components (a full instrument
 * cluster, a control dock with labels) stay comfortably legible rather
 * than shrinking below a usable size. */
const STAGE_HEIGHT = 440;

interface PreviewStageProps {
  className?: string;
  children: ReactNode;
  /**
   * For components with a fixed, known aspect ratio (width / height) that
   * are designed to fill whatever box they're given (a 3D scene with its
   * own internal camera fit, an iframe with a CSS `aspect-ratio`) — sized
   * directly via width/height so the component's own logic adapts it,
   * with no CSS transform involved.
   */
  aspectRatio?: number;
}

/** Largest box of `aspectRatio` (or matching `naturalHeight` at `containerWidth`)
 * that fits within (containerWidth, STAGE_HEIGHT), preserving proportions. */
function containBox(containerWidth: number, aspectRatio: number) {
  let width = STAGE_HEIGHT * aspectRatio;
  let height = STAGE_HEIGHT;
  if (width > containerWidth) {
    width = containerWidth;
    height = containerWidth / aspectRatio;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

function AspectPreviewStage({ aspectRatio, className, children }: { aspectRatio: number; className?: string; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const compute = () => {
      if (el.clientWidth > 0) setBox(containBox(el.clientWidth, aspectRatio));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspectRatio]);

  return (
    <div
      ref={stageRef}
      className={cn("flex w-full items-center justify-center overflow-hidden", className)}
      style={{ height: STAGE_HEIGHT }}
    >
      {box && (
        <div style={{ width: box.width, height: box.height }}>{children}</div>
      )}
    </div>
  );
}

function AutoPreviewStage({ className, children }: { className?: string; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) {
        setStageWidth(w);
        setNaturalHeight(null); // container size changed — the child's natural height at the new width is unknown until remeasured
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el || !stageWidth) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h && h > 0) setNaturalHeight((prev) => (prev != null && Math.abs(prev - h) < 0.5 ? prev : h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageWidth]);

  // Measured at full stage width, so scale only ever needs to shrink to fit
  // the height (never upscales past the width the card already gives it).
  const scale = naturalHeight ? Math.min(1, STAGE_HEIGHT / naturalHeight) : 1;

  return (
    <div
      ref={stageRef}
      className={cn("flex w-full items-center justify-center overflow-hidden", className)}
      style={{ height: STAGE_HEIGHT }}
    >
      <div
        ref={measureRef}
        className="[&>*]:mx-auto"
        style={{
          width: stageWidth || "100%",
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Shared showcase preview area: reserves a consistent height across every
 * card and centers the live component inside it, scaling (never cropping
 * or distorting) to fit — so components with very different natural
 * footprints still read as one coherent grid. Pass `aspectRatio` for a
 * component that fills whatever box it's given (3D scenes, the sketchbook
 * iframe); omit it for a component that sizes itself and needs its
 * rendered footprint measured instead. */
export function PreviewStage({ aspectRatio, className, children }: PreviewStageProps) {
  if (aspectRatio != null) {
    return (
      <AspectPreviewStage aspectRatio={aspectRatio} className={className}>
        {children}
      </AspectPreviewStage>
    );
  }
  return <AutoPreviewStage className={className}>{children}</AutoPreviewStage>;
}
