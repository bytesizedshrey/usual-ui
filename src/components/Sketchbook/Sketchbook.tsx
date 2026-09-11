import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { buildSketchbookDoc } from "./sketchbookDoc";

export interface SketchbookProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Which plate to show on load (0-8). Default: 0. */
  startPlate?: number;
  /** Show/hide the draggable magnifying glass. Default: true. */
  magnifier?: boolean;
  /** Play the riffle intro animation on mount. Default: true. */
  intro?: boolean;
}

const Sketchbook = ({ startPlate = 0, magnifier = true, intro = true, style, ...rest }: SketchbookProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.srcdoc = buildSketchbookDoc({ startPlate, magnifier, intro });
  }, [startPlate, magnifier, intro]);

  return (
    <div
      {...rest}
      style={{ width: "100%", maxWidth: 640, margin: "0 auto", background: "transparent", ...style }}
    >
      <iframe
        ref={frameRef}
        title="Sketchbook — Sadie Sink plate set"
        sandbox="allow-scripts"
        loading="eager"
        style={{
          display: "block",
          width: "100%",
          aspectRatio: "640 / 340",
          border: 0,
          background: "transparent",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default Sketchbook;
