import type { CSSProperties } from "react";

export type DotMatrixGlyphs = Record<string, string[]>;

export const DOT_MATRIX_GLYPHS: DotMatrixGlyphs = {
  "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  "$": ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "\u20ac": ["00110", "01001", "11100", "01000", "11100", "01001", "00110"],
  "\u00a3": ["00110", "01001", "01000", "11110", "01000", "01000", "11111"],
  "\u00a5": ["10001", "01010", "00100", "11111", "00100", "11111", "00100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  ",": ["00", "00", "00", "00", "00", "01", "10"],
  ".": ["00", "00", "00", "00", "00", "00", "10"],
  " ": ["00", "00", "00", "00", "00", "00", "00"],
};

export const DOT_MATRIX_ROWS = 7;

export interface DotMatrixProps {
  text: string;
  height?: string;
  center?: boolean;
  litFill?: string;
  offFill?: string;
  shadowFill?: string;
  dotRadius?: number;
  offDotRadius?: number;
  gap?: number;
  gradientId: string;
  gradientStops?: { offset: string; color: string }[];
  ariaLabel?: string;
  style?: CSSProperties;
  className?: string;
}

// Renders text as a lit dot-matrix readout: every cell in the grid gets a dim
// "unlit" dot so the panel reads as a physical display, and lit cells layer a
// drop-shadow dot under a gradient-filled dot on top for a slight emboss.
export function DotMatrix({
  text,
  height,
  center,
  offFill = "rgba(255,255,255,0.05)",
  shadowFill = "rgba(0,0,0,0.5)",
  dotRadius = 0.42,
  offDotRadius = 0.26,
  gap = 1,
  gradientId,
  gradientStops = [
    { offset: "0", color: "#fffdf4" },
    { offset: "0.5", color: "#e9e5d9" },
    { offset: "1", color: "#a5a094" },
  ],
  ariaLabel,
  style,
  className,
}: DotMatrixProps) {
  const rows = DOT_MATRIX_ROWS;
  const items: { glyph: string[]; x: number }[] = [];
  let x = 0;

  for (const char of text) {
    const glyph = DOT_MATRIX_GLYPHS[char] ?? DOT_MATRIX_GLYPHS[" "];
    items.push({ glyph, x });
    x += glyph[0].length + gap;
  }

  const cols = Math.max(1, x - gap);
  const off: { cx: number; cy: number }[] = [];
  const shadow: { cx: number; cy: number }[] = [];
  const lit: { cx: number; cy: number }[] = [];

  for (let cx = 0; cx < cols; cx++) {
    for (let cy = 0; cy < rows; cy++) off.push({ cx: cx + 0.5, cy: cy + 0.5 });
  }

  for (const item of items) {
    item.glyph.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        if (row[rx] !== "1") continue;
        const cx = item.x + rx + 0.5;
        const cy = ry + 0.5;
        shadow.push({ cx, cy: cy + 0.11 });
        lit.push({ cx, cy });
      }
    });
  }

  const box: CSSProperties = height
    ? {
        display: "block",
        height,
        width: `calc(${(cols / rows).toFixed(4)} * ${height})`,
        maxWidth: "100%",
        overflow: "visible",
        ...(center ? { marginLeft: "auto", marginRight: "auto" } : {}),
        ...style,
      }
    : { display: "block", width: "100%", height: "auto", overflow: "visible", ...style };

  return (
    <svg
      aria-label={ariaLabel ?? text}
      className={className}
      preserveAspectRatio="xMinYMid meet"
      role="img"
      style={box}
      viewBox={`0 0 ${cols} ${rows}`}
    >
      <defs>
        <radialGradient cx="0.36" cy="0.28" id={gradientId} r="0.8">
          {gradientStops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </radialGradient>
      </defs>
      <g fill={offFill}>
        {off.map((dot, i) => (
          <circle cx={dot.cx} cy={dot.cy} key={`o${i}`} r={offDotRadius} />
        ))}
      </g>
      <g fill={shadowFill}>
        {shadow.map((dot, i) => (
          <circle cx={dot.cx} cy={dot.cy} key={`s${i}`} r={dotRadius} />
        ))}
      </g>
      <g fill={`url(#${gradientId})`}>
        {lit.map((dot, i) => (
          <circle cx={dot.cx} cy={dot.cy} key={`l${i}`} r={dotRadius} />
        ))}
      </g>
    </svg>
  );
}
