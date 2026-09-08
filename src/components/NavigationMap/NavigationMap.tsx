"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

export type TurnDirection =
  | "left"
  | "slight-left"
  | "straight"
  | "slight-right"
  | "right"
  | "sharp-right"
  | "u-turn"
  | "roundabout";

export type SpeedUnit = "MPH" | "KM/H";

export type MapTheme = "graphite" | "midnight" | "ember" | "teal";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface NavigationMapProps {
  /** Distance to the next turn, e.g. "900 m" or "0.4 mi". */
  distance?: string;
  /** Street the next turn is on. */
  streetName?: string;
  /** Posted speed limit shown on the sign. */
  speedLimit?: number;
  /** Speed unit. Not shown on the sign face in the compact widget (matches the finalized design); exposed via a `data-speed-unit` attribute for consumers that need it. */
  speedUnit?: SpeedUnit;
  /** Which glyph the turn-instruction icon renders. */
  turnDirection?: TurnDirection;
  /** Route line color (hex). */
  routeColor?: string;
  /** Subtle color wash applied over the map surface. */
  mapTheme?: MapTheme;
  /** Destination address shown in the top-left pill. */
  destination?: string;
  /** Label above the destination value. */
  destinationLabel?: string;
  /** Estimated arrival time, shown in the HUD bar. */
  arrivalTime?: string;
  /** Remaining distance/time, shown in the HUD bar. */
  remaining?: string;
  /** Remaining vehicle range, shown in the HUD bar. */
  range?: string;
  /**
   * Current vehicle coordinates. The map surface is procedurally generated
   * (not tile-based), so this is a passthrough for callers wiring the widget
   * to a real geo source rather than something rendered directly.
   */
  currentLocation?: LatLng;
  /** Additional class names for the root element. */
  className?: string;
}

const ZOOM_MIN = 0.76;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.16;
const HIDE_READOUTS_BELOW = 355;
const HIDE_RANGE_BELOW = 445;

const ROUTE_D =
  "M600 1080 L600 700 C600 654 601 624 601 580 L601 546 C601 494 632 466 692 466 L852 466 C900 466 922 440 922 396 L922 90";

/** Scoped to this component (not injected globally) — the site's own type system stays Geist. */
const NAV_MAP_STYLES =
  "@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');" +
  "@keyframes nm-dash{to{stroke-dashoffset:-240}}" +
  "@keyframes nm-draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}" +
  "@keyframes nm-ring{0%{r:22;opacity:.4}70%{r:58;opacity:0}100%{r:58;opacity:0}}" +
  "@keyframes nm-drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-6px,8px,0)}100%{transform:translate3d(0,0,0)}}" +
  "@keyframes nm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}";

interface RoadSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface RectShape {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BuildingShape extends RectShape {
  o: string;
}

interface MapGeometry {
  majorRoads: RoadSegment[];
  minorRoads: RoadSegment[];
  buildings: BuildingShape[];
  parks: RectShape[];
  water: RectShape[];
}

/** Deterministic PRNG (mulberry32) so the procedural map layout is stable across renders. */
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Procedurally generates the dark automotive map's roads/buildings/parks/water. Not tile-based. */
function generateGeometry(seed: number): MapGeometry {
  const r = createRng(seed);
  const majorRoads: RoadSegment[] = [];
  const minorRoads: RoadSegment[] = [];
  const buildings: BuildingShape[] = [];
  const parks: RectShape[] = [];
  const water: RectShape[] = [];
  const xs: number[] = [];
  const ys: number[] = [];

  for (let x = -60; x <= 1260; x += 158) xs.push(x + Math.round(r() * 24 - 12));
  for (let y = -60; y <= 1260; y += 146) ys.push(y + Math.round(r() * 24 - 12));

  xs.forEach((x, i) => {
    const bag = i % 2 === 0 ? majorRoads : minorRoads;
    bag.push({ x1: x, y1: -80, x2: x + Math.round(r() * 36 - 18), y2: 1280 });
  });
  ys.forEach((y, i) => {
    const bag = i % 3 === 0 ? majorRoads : minorRoads;
    bag.push({ x1: -80, y1: y, x2: 1280, y2: y + Math.round(r() * 28 - 14) });
  });

  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i] + 15;
      const y0 = ys[j] + 13;
      const cw = xs[i + 1] - xs[i] - 30;
      const ch = ys[j + 1] - ys[j] - 26;
      if (cw < 36 || ch < 36) continue;
      if (r() < 0.07) {
        parks.push({ x: x0, y: y0, w: cw, h: ch });
        continue;
      }
      const cols = 2 + Math.floor(r() * 2);
      const rows = 2 + Math.floor(r() * 2);
      for (let a = 0; a < cols; a++) {
        for (let b = 0; b < rows; b++) {
          if (r() < 0.24) continue;
          const bw = cw / cols;
          const bh = ch / rows;
          const pad = 3 + r() * 5;
          buildings.push({
            x: Math.round(x0 + a * bw + pad),
            y: Math.round(y0 + b * bh + pad),
            w: Math.max(6, Math.round(bw - pad * 2)),
            h: Math.max(6, Math.round(bh - pad * 2)),
            o: (0.35 + r() * 0.55).toFixed(2),
          });
        }
      }
    }
  }

  water.push({ x: -120, y: 40, w: 1440, h: 110 });

  return { majorRoads, minorRoads, buildings, parks, water };
}

/** Computed once — the seed is a fixed constant, so every instance shares the same layout. */
const GEOMETRY = generateGeometry(20260908);

interface TurnGlyph {
  path: string;
  head: string;
}

const TURN_GLYPHS: Record<TurnDirection, TurnGlyph> = {
  right: { path: "M14 47 V30 C14 22 19 17 27 17 H40", head: "36,6 53,17 36,28" },
  left: { path: "M46 47 V30 C46 22 41 17 33 17 H20", head: "24,6 7,17 24,28" },
  straight: { path: "M30 47 V20", head: "30,4 43,20 17,20" },
  "slight-right": { path: "M18 47 V33 C18 26 21 22 27 18 L36 12", head: "33,5 50,10 42,24" },
  "slight-left": { path: "M42 47 V33 C42 26 39 22 33 18 L24 12", head: "27,5 10,10 18,24" },
  "sharp-right": { path: "M14 47 V26 C14 19 20 15 27 18 L38 23", head: "34,10 50,22 32,32" },
  "u-turn": { path: "M18 47 V27 C18 18 25 12 33 12 C41 12 47 18 47 27 V33", head: "39,31 47,46 55,31" },
  roundabout: { path: "M22 47 V36 C22 29 27 25 34 25 C41 25 45 21 45 15", head: "39,17 45,4 51,17" },
};

const THEME_TINT: Record<MapTheme, CSSProperties> = {
  midnight: { mixBlendMode: "soft-light", background: "#7f8ba8", opacity: 0.06 },
  graphite: { mixBlendMode: "soft-light", background: "#b0b0b0", opacity: 0.05 },
  ember: { mixBlendMode: "soft-light", background: "#c98a5c", opacity: 0.06 },
  teal: { mixBlendMode: "soft-light", background: "#5fada8", opacity: 0.06 },
};

const RAISED_SHELL_BG = "linear-gradient(180deg, #202020 0%, #191919 100%)";
const RAISED_SHELL_SHADOW =
  "0 1px 0.5px #ffffff1a inset, 0 1px 2px #ffffff35 inset, 0 10px 10px -9px #00000070, 0 20px 20px -14px #00000060, 0 0px 6px 0px #00000060";
const CHIP_SHADOW =
  "0 1px 0.5px #ffffff1a inset, 0 1px 2px #ffffff35 inset, 0 6px 8px -6px #00000090, 0 0px 4px 0px #00000060";
const INSET_WELL_SHADOW = "0 0.5px 0 #ffffff50, 0 2px 5px #00000090 inset";
const BUTTON_SHADOW = "0 1px 0.5px #ffffff1a inset, 0 1px 2px #ffffff35 inset, 0 3px 5px -2px #00000090";

function NavigationMap({
  distance = "900 m",
  streetName = "Ness Ave",
  speedLimit = 55,
  speedUnit = "MPH",
  turnDirection = "right",
  routeColor = "#c8382c",
  mapTheme = "graphite",
  destination = "1408 Ness Ave",
  destinationLabel = "Destination",
  arrivalTime = "4:38",
  remaining = "8.2 km",
  range = "214 km",
  currentLocation = { lat: 37.7793, lng: -122.4193 },
  className,
}: NavigationMapProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(500);
  const [zoom, setZoom] = useState(1);
  const [px, setPx] = useState(0);
  const [py, setPy] = useState(0);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const sync = () => {
      const w = el.clientWidth;
      setWidth((prev) => (Math.abs(w - prev) > 3 ? w : prev));
    };

    sync();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", sync);
      return () => window.removeEventListener("resize", sync);
    }

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geometry = useMemo(() => GEOMETRY, []);
  const glyph = TURN_GLYPHS[turnDirection] ?? TURN_GLYPHS.right;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPx(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
    setPy(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
  };

  const handlePointerLeave = () => {
    setPx(0);
    setPy(0);
  };

  const recenter = () => {
    setPx(0);
    setPy(0);
    setZoom(1);
  };

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));

  const distanceMatch = distance.trim().match(/^([\d.,]+)\s*(.*)$/);
  const distanceValue = distanceMatch ? distanceMatch[1] : distance;
  const distanceUnit = distanceMatch && distanceMatch[2] ? distanceMatch[2] : "";

  const hideReadouts = width < HIDE_READOUTS_BELOW;
  const hideRange = width < HIDE_RANGE_BELOW;
  const signSize = width < HIDE_READOUTS_BELOW ? 38 : 46;
  const signBottom = width < HIDE_READOUTS_BELOW ? 54 : 60;

  return (
    <div
      className={cn("relative w-full", className)}
      data-current-lat={currentLocation.lat}
      data-current-lng={currentLocation.lng}
      data-speed-unit={speedUnit}
      style={{
        boxSizing: "border-box",
        maxWidth: 500,
        minWidth: 0,
        aspectRatio: "500 / 316",
        minHeight: 260,
        padding: 6,
        borderRadius: 20,
        background: RAISED_SHELL_BG,
        boxShadow: RAISED_SHELL_SHADOW,
      }}
    >
      <style>{NAV_MAP_STYLES}</style>
      <div
        ref={frameRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          boxSizing: "border-box",
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
          borderRadius: 15,
          background: "#0d0d0d",
          boxShadow: "0 0.5px 0 #ffffff50, 0 2px 6px #00000090 inset, 0 0 0 1px #00000080 inset",
          touchAction: "none",
        }}
      >
        {/* Map surface */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.45) 8%, #000 30%, #000 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.45) 8%, #000 30%, #000 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "-35%",
              top: "-46%",
              width: "170%",
              height: "185%",
              transformOrigin: "50% 62%",
              transition: "transform .9s cubic-bezier(.16,.84,.24,1)",
              transform: "translateY(-4%) perspective(2600px) rotateX(49deg) rotateZ(-14deg) scale(.8)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "50% 62%",
                transition: "transform .8s cubic-bezier(.16,.84,.24,1)",
                transform: `rotate(${px * 2}deg) scale(${zoom}) translate3d(${px * -16}px, ${py * -12}px, 0)`,
              }}
            >
              <div style={{ position: "absolute", inset: 0, animation: "nm-drift 34s ease-in-out infinite" }}>
                <svg
                  viewBox="0 0 1200 1200"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  style={{ display: "block", overflow: "visible" }}
                >
                  <rect x={0} y={0} width={1200} height={1200} fill="#0e0e0e" />

                  {geometry.parks.map((p, i) => (
                    <rect key={`park-${i}`} x={p.x} y={p.y} width={p.w} height={p.h} rx={8} fill="#131512" />
                  ))}
                  {geometry.water.map((w, i) => (
                    <rect key={`water-${i}`} x={w.x} y={w.y} width={w.w} height={w.h} rx={20} fill="#101315" />
                  ))}
                  {geometry.buildings.map((b, i) => (
                    <rect key={`bldg-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx={2} fill="#1b1b1b" opacity={b.o} />
                  ))}

                  <g stroke="#1f1f1f" strokeWidth={3} strokeLinecap="round">
                    {geometry.minorRoads.map((r, i) => (
                      <line key={`minor-${i}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
                    ))}
                  </g>
                  <g stroke="#282828" strokeWidth={11} strokeLinecap="round">
                    {geometry.majorRoads.map((r, i) => (
                      <line key={`major-${i}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
                    ))}
                  </g>
                  <g stroke="#343434" strokeWidth={3} strokeLinecap="round" opacity={0.8}>
                    {geometry.majorRoads.map((r, i) => (
                      <line key={`major-center-${i}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
                    ))}
                  </g>

                  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ROUTE_D} stroke="#070707" strokeWidth={27} opacity={0.9} />
                    <path
                      d={ROUTE_D}
                      stroke={routeColor}
                      style={{ filter: "blur(8px)" }}
                      strokeWidth={26}
                      opacity={0.1}
                    />
                    <path d={ROUTE_D} stroke={routeColor} strokeWidth={14} />
                    <path
                      d={ROUTE_D}
                      stroke="#ffb8ad"
                      strokeWidth={3}
                      opacity={0.26}
                      pathLength={1000}
                      strokeDasharray={1000}
                      style={{ animation: "nm-draw 2.2s cubic-bezier(.4,0,.2,1) both" }}
                    />
                    <path
                      d={ROUTE_D}
                      stroke="#ffd2c9"
                      strokeWidth={5}
                      opacity={0.28}
                      strokeDasharray="28 132"
                      style={{ animation: "nm-dash 4.2s linear infinite" }}
                    />
                  </g>

                  <g style={{ animation: "nm-bob 4.4s ease-in-out infinite" }}>
                    <path d="M600 652 L658 736 A 72 72 0 0 1 542 736 Z" fill="#cfcfcf" opacity={0.06} />
                    <circle
                      cx={600}
                      cy={716}
                      r={22}
                      fill="none"
                      stroke="#bdbdbd"
                      strokeWidth={2}
                      opacity={0.35}
                      style={{ animation: "nm-ring 3.4s ease-out infinite" }}
                    />
                    <circle cx={600} cy={716} r={22} fill="#141414" stroke="#3d3d3d" strokeWidth={2} />
                    <circle cx={600} cy={716} r={17} fill="#1c1c1c" />
                    <path d="M600 698 L616 732 L600 723 L584 732 Z" fill="#f0f0f0" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", ...THEME_TINT[mapTheme] }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(120% 60% at 50% 0%, rgba(0,0,0,.7) 0%, transparent 52%), radial-gradient(100% 55% at 50% 100%, rgba(0,0,0,.45) 0%, transparent 72%)",
            }}
          />
        </div>

        {/* Top overlay: destination pill + controls */}
        <div
          style={{
            position: "absolute",
            top: 9,
            left: 9,
            right: 9,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              minWidth: 0,
              padding: "5px 9px 5px 6px",
              borderRadius: 9,
              background: RAISED_SHELL_BG,
              boxShadow: CHIP_SHADOW,
              pointerEvents: "auto",
            }}
          >
            <span
              style={{
                display: "grid",
                placeItems: "center",
                flex: "none",
                width: 18,
                height: 18,
                borderRadius: 6,
                background: "#101010",
                boxShadow: INSET_WELL_SHADOW,
              }}
            >
              <svg width={8} height={8} viewBox="0 0 12 12" aria-hidden="true">
                <circle cx={6} cy={6} r={3.4} fill="#c8382c" />
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 7.5,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: "#8a8a8a",
                  lineHeight: 1.5,
                }}
              >
                {destinationLabel}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: "-.01em",
                  color: "#ededed",
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {destination}
              </span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              flex: "none",
              padding: 4,
              borderRadius: 11,
              background: RAISED_SHELL_BG,
              boxShadow: CHIP_SHADOW,
              pointerEvents: "auto",
            }}
          >
            <ControlButton label="Recenter" onClick={recenter}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3.8 14.4 12 12 20.2 9.6 12Z" />
              </svg>
            </ControlButton>
            <ControlButton label="Zoom in" onClick={zoomIn}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" aria-hidden="true">
                <path d="M12 5.5v13M5.5 12h13" />
              </svg>
            </ControlButton>
            <ControlButton label="Zoom out" onClick={zoomOut}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" aria-hidden="true">
                <path d="M5.5 12h13" />
              </svg>
            </ControlButton>
          </div>
        </div>

        {/* Speed-limit sign */}
        <div
          style={{
            position: "absolute",
            right: 9,
            bottom: signBottom,
            display: "grid",
            placeItems: "center",
            boxSizing: "border-box",
            width: signSize,
            height: signSize,
            padding: 3,
            borderRadius: 999,
            background: RAISED_SHELL_BG,
            boxShadow: "0 1px 0.5px #ffffff1a inset, 0 1px 2px #ffffff35 inset, 0 8px 9px -7px #00000080, 0 0px 5px 0px #00000060",
            transition: "transform .18s cubic-bezier(.3,1.5,.5,1), width .3s ease, height .3s ease, bottom .3s ease",
          }}
        >
          <span
            style={{
              position: "relative",
              display: "grid",
              placeItems: "center",
              width: "100%",
              height: "100%",
              borderRadius: 999,
              background: "radial-gradient(120% 120% at 50% 0%, #fbfbfb 0%, #e4e4e2 100%)",
              boxShadow: "0 2px 4px #00000075 inset, 0 -1px 0 #ffffff80 inset",
            }}
          >
            <span style={{ position: "absolute", inset: 4, borderRadius: 999, border: "3px solid #b8322a" }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                fontWeight: 700,
                color: "#16110f",
                letterSpacing: "-.04em",
                lineHeight: 1,
              }}
            >
              {speedLimit}
            </span>
          </span>
        </div>

        {/* Bottom HUD bar */}
        <div
          style={{
            position: "absolute",
            left: 9,
            right: 9,
            bottom: 9,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 9px",
            borderRadius: 13,
            background: RAISED_SHELL_BG,
            boxShadow:
              "0 1px 0.5px #ffffff1a inset, 0 1px 2px #ffffff35 inset, 0 8px 10px -8px #00000080, 0 16px 18px -14px #00000060, 0 0px 5px 0px #00000060",
          }}
        >
          <span
            style={{
              display: "grid",
              placeItems: "center",
              flex: "none",
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#0e0e0e",
              boxShadow: INSET_WELL_SHADOW,
            }}
          >
            <svg width={23} height={20} viewBox="0 0 60 52" fill="none" aria-hidden="true">
              <path d={glyph.path} stroke="#d8564a" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
              <polygon points={glyph.head} fill="#d8564a" />
            </svg>
          </span>

          <span style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0, flex: "1 1 auto" }}>
            <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 21,
                  fontWeight: 700,
                  letterSpacing: "-.04em",
                  lineHeight: 1.1,
                  color: "#f4f4f4",
                  textShadow: "0 1px 0 rgba(0,0,0,.6)",
                }}
              >
                {distanceValue}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#949494",
                  letterSpacing: ".02em",
                }}
              >
                {distanceUnit}
              </span>
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "-.005em",
                color: "#cfcfcf",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {streetName}
            </span>
          </span>

          {!hideReadouts && (
            <span
              style={{
                display: "block",
                flex: "none",
                alignSelf: "stretch",
                width: 2,
                borderRadius: 2,
                background: "linear-gradient(180deg, transparent, #0b0b0b 50%, transparent)",
                boxShadow: "1px 0 0 #ffffff12",
              }}
            />
          )}

          {!hideReadouts && (
            <span style={{ display: "flex", gap: 5, flex: "none", overflow: "hidden" }}>
              <Readout label="Arr" value={arrivalTime} />
              <Readout label="Left" value={remaining} />
              {!hideRange && (
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    padding: "4px 7px",
                    borderRadius: 8,
                    background: "#0e0e0e",
                    boxShadow: INSET_WELL_SHADOW,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: "#848484",
                      lineHeight: 1.4,
                    }}
                  >
                    Range
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#e4e4e4",
                      lineHeight: 1.2,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 999,
                        background: "#4fbf87",
                        boxShadow: "0 0 4px rgba(79,191,135,.55)",
                      }}
                    />
                    <span>{range}</span>
                  </span>
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <span
      style={{
        display: "grid",
        placeItems: "center",
        width: 26,
        height: 26,
        padding: 2,
        boxSizing: "border-box",
        borderRadius: 999,
        background: "#0f0f0f",
        boxShadow: INSET_WELL_SHADOW,
      }}
    >
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setActive(false);
        }}
        onMouseDown={() => setActive(true)}
        onMouseUp={() => setActive(false)}
        style={{
          display: "grid",
          placeItems: "center",
          width: "100%",
          height: "100%",
          aspectRatio: "1",
          border: 0,
          borderRadius: 999,
          background: RAISED_SHELL_BG,
          boxShadow: active
            ? "0 2px 4px #00000090 inset"
            : hovered
              ? "0 1px 0.5px #ffffff26 inset, 0 1px 2px #ffffff45 inset, 0 5px 8px -3px #00000099"
              : BUTTON_SHADOW,
          color: hovered ? "#ffffff" : "#c9c9c9",
          cursor: "pointer",
          transform: active ? "scale(.92)" : undefined,
          transition: "transform .12s cubic-bezier(.3,1.6,.5,1), color .15s ease, box-shadow .15s ease",
        }}
      >
        {children}
      </button>
    </span>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        padding: "4px 7px",
        borderRadius: 8,
        background: "#0e0e0e",
        boxShadow: INSET_WELL_SHADOW,
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#848484",
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          color: "#e4e4e4",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
    </span>
  );
}

export default NavigationMap;
export { NavigationMap };
