"use client";

import { cn } from "@/lib/utils";

import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

// An earlier version of this card tried a genuine CSS 3D scene and broke
// pointer hit-testing for interactive content. On inspection, that attempt
// cascaded `transform-style: preserve-3d` onto *every* descendant
// (`[&>*]:[transform-style:preserve-3d]`) — reaching all the way down into
// each live component's own internal markup, canvases included, several
// independent 3D contexts deep. That is what broke: not "preserve-3d +
// translateZ" as a technique, but an uncontrolled cascade of it into DOM the
// showcase doesn't own.
//
// This version uses the real technique — one shared 3D scene, genuine
// per-CardItem translateZ — but scopes it deliberately:
//   - `perspective` lives on the outer, non-transformed wrapper.
//   - Exactly one element tilts: the inner wrapper, via mouse-tracked
//     rotateX/rotateY, with `transform-style: preserve-3d` so its children
//     share its 3D space.
//   - CardBody also carries `preserve-3d`, so each CardItem (title,
//     description, preview, Source Code button) gets a real, independent
//     translateZ within that one shared scene — genuine depth separation,
//     not a parallax approximation.
//   - Each CardItem is explicitly `transform-style: flat`. This is the
//     safety boundary: whatever a CardItem renders (a live component, a
//     WebGL canvas, PreviewStage's own scaling) renders as ordinary flat
//     content positioned at that one Z-depth, not as further nested 3D
//     layers. The 3D scene is exactly two levels deep (tilt wrapper →
//     CardBody → CardItems) and stops there by construction.
// Plain 2D transforms and translateZ inside a flat context are always
// pixel-exact for hit-testing; the earlier failure only ever reproduced
// with an uncontrolled multi-level cascade, which this structure can't do.
const MAX_TILT_DEG = 8;
const HOVER_LIFT_PX = 16;
const HOVER_SCALE = 1.02;
const ENTER_MS = 120;
const LEAVE_MS = 550;
// A gentle "settle" curve — reads as a soft spring return, not a linear snap.
const SPRING_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const NEUTRAL_TRANSFORM = "rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)";

export const CardContainer = ({
  children,
  className,
  containerClassName,
  maxTilt = MAX_TILT_DEG,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** Caps the tilt rotation in degrees. Taller/denser previews should pass a smaller value so far edges don't displace as much for the same angle. */
  maxTilt?: number;
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const applyTilt = useCallback(
    (clientX: number, clientY: number) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) - 0.5;
      const ny = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)) - 0.5;
      const rotateY = nx * 2 * maxTilt;
      const rotateX = -ny * 2 * maxTilt;
      el.style.transitionDuration = `${ENTER_MS}ms`;
      el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${HOVER_LIFT_PX}px) scale(${HOVER_SCALE})`;
    },
    [maxTilt],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => applyTilt(clientX, clientY));
  };

  const handleMouseEnter = () => setIsMouseEntered(true);

  const handleMouseLeave = () => {
    setIsMouseEntered(false);
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const el = wrapRef.current;
    if (!el) return;
    el.style.transitionDuration = `${LEAVE_MS}ms`;
    el.style.transform = NEUTRAL_TRANSFORM;
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn(
          "h-full py-20 flex items-center justify-center",
          containerClassName
        )}
        style={{ perspective: "1200px" }}
      >
        <div
          ref={wrapRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "h-full w-full flex items-center justify-center relative will-change-transform transition-transform [transform-style:preserve-3d]",
            className
          )}
          style={{
            transform: NEUTRAL_TRANSFORM,
            transitionDuration: `${LEAVE_MS}ms`,
            transitionTimingFunction: SPRING_EASE,
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-96 w-96 [transform-style:preserve-3d] hover:shadow-xl hover:shadow-black/10 transition-shadow duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  /** Real Z depth within the card's shared 3D scene — larger values pop further toward the viewer on hover. */
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  [key: string]: any;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useMouseEnter();

  useEffect(() => {
    if (!ref.current) return;
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  return (
    <Tag
      ref={ref}
      className={cn(
        "w-fit transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [transform-style:flat]",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

// Create a hook to use the context
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};
