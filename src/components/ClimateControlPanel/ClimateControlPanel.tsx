"use client";

import React from "react";
import { type ComponentPropsWithoutRef } from "react";
import "./styles.css";

export type AirIntakeMode = "fresh" | "recirc";

export interface ClimateControlPanelChangeState {
  defrost: boolean;
  ac: boolean;
  intake: AirIntakeMode;
}

type PressTarget = "defrost" | "ac" | "fresh" | "recirc";

export interface ClimateControlPanelProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Initial state of the front defrost toggle. */
  defaultDefrostOn?: boolean;
  /** Initial state of the A/C toggle. */
  defaultAcOn?: boolean;
  /** Initial air intake mode. */
  defaultIntake?: AirIntakeMode;
  /** Color of the A/C indicator LED. */
  ledColor?: string;
  /** Enable the procedural button-click sound. */
  sound?: boolean;
  /** Enable haptic feedback (vibration) on press, where supported. */
  haptics?: boolean;
  /** Show the status line beneath the panel. */
  showStatus?: boolean;
  /** Called whenever any control changes. */
  onChange?: (state: ClimateControlPanelChangeState) => void;
}

const noiseOverlay = (baseFrequency: string, size: number) =>
  `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22${size}%22 height=%22${size}%22 viewBox=%220 0 ${size} ${size}%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%22${baseFrequency}%22 numOctaves=%223%22 stitchTiles=%22stitch%22></feTurbulence><feColorMatrix type=%22saturate%22 values=%220%22></feColorMatrix></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22></rect></svg>')`;

const PANEL_WIDTH = 460;

const inkColor = (on: boolean) => (on ? "#eeebe5" : "#a9a6a1");

/** Depth transform: a latched (toggled-on) control sits sunk in the housing, idle controls stand proud. */
function formTransform(latched: boolean, pressed: boolean): string {
  if (latched && pressed) return "translateY(5.5px) scale(0.964)";
  if (pressed) return "translateY(4.5px) scale(0.97)";
  if (latched) return "translateY(4px) scale(0.972)";
  return "none";
}

function liftOpacity(latched: boolean, pressed: boolean): number {
  return latched || pressed ? 0.06 : 1;
}

export default function ClimateControlPanel({
  defaultDefrostOn = false,
  defaultAcOn = true,
  defaultIntake = "fresh",
  ledColor = "#2edc46",
  sound = true,
  haptics = true,
  showStatus = true,
  onChange,
  style,
  ...props
}: ClimateControlPanelProps) {
  const [defrost, setDefrost] = React.useState(defaultDefrostOn);
  const [ac, setAc] = React.useState(defaultAcOn);
  const [intake, setIntake] = React.useState<AirIntakeMode>(defaultIntake);
  const [press, setPress] = React.useState<PressTarget | null>(null);
  const [scale, setScale] = React.useState(1);

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const freshRef = React.useRef<HTMLButtonElement>(null);
  const recircRef = React.useRef<HTMLButtonElement>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const noiseBufferRef = React.useRef<AudioBuffer | null>(null);

  React.useEffect(() => {
    const fit = () => {
      if (!wrapRef.current || !stageRef.current) return;
      const next = Math.min(1, wrapRef.current.clientWidth / (stageRef.current.offsetWidth || 1));
      setScale((prev) => (Math.abs(prev - next) > 0.002 ? next : prev));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(wrapRef.current!);
    fit();
    const t = setTimeout(fit, 300);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

  React.useEffect(() => () => {
    audioContextRef.current?.close?.();
  }, []);

  const getAudioContext = () => {
    if (audioContextRef.current) return audioContextRef.current;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      const len = Math.floor(ctx.sampleRate * 0.1);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
      noiseBufferRef.current = buffer;
      audioContextRef.current = ctx;
      return ctx;
    } catch {
      return null;
    }
  };

  const playClick = (up: boolean) => {
    if (!sound) return;
    const ctx = getAudioContext();
    const noise = noiseBufferRef.current;
    if (!ctx || !noise) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const v = 0.9 + Math.random() * 0.2;
      const t = up ? 0.45 : 1;

      const src = ctx.createBufferSource();
      src.buffer = noise;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = (up ? 2900 : 2200) * v;
      bp.Q.value = 1.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.16 * v * t, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      src.connect(bp);
      bp.connect(g);
      g.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.1);

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime((up ? 190 : 150) * v, now);
      osc.frequency.exponentialRampToValueAtTime(88, now + 0.05);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.15 * v * t, now);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      osc.connect(og);
      og.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      /* noop: sound is best-effort */
    }
  };

  const down = (target: PressTarget) => {
    if (press === target) return;
    playClick(false);
    if (haptics && navigator.vibrate) {
      try {
        navigator.vibrate(9);
      } catch {
        /* noop */
      }
    }
    setPress(target);
  };

  const liftUp = () => {
    if (press === null) return;
    playClick(true);
    setPress(null);
  };

  const keyDown = (target: PressTarget) => (e: React.KeyboardEvent) => {
    if (e.repeat) return;
    if (e.key === " " || e.key === "Enter" || e.key === "Spacebar") down(target);
  };

  const emit = (next: ClimateControlPanelChangeState) => onChange?.(next);

  const toggleDefrost = () => {
    const next = !defrost;
    setDefrost(next);
    emit({ defrost: next, ac, intake });
  };

  const toggleAc = () => {
    const next = !ac;
    setAc(next);
    emit({ defrost, ac: next, intake });
  };

  const selectIntake = (next: AirIntakeMode) => {
    if (intake === next) return;
    setIntake(next);
    emit({ defrost, ac, intake: next });
  };

  const onIntakeKeyDown = (target: "fresh" | "recirc") => (e: React.KeyboardEvent) => {
    keyDown(target)(e);
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      selectIntake("fresh");
      freshRef.current?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      selectIntake("recirc");
      recircRef.current?.focus();
    }
  };

  const dPressed = press === "defrost";
  const aPressed = press === "ac";
  const fPressed = press === "fresh";
  const rPressed = press === "recirc";
  const fresh = intake === "fresh";
  const recirc = intake === "recirc";

  const statusLine = [
    `defrost ${defrost ? "on" : "off"}`,
    `a/c ${ac ? "on" : "off"}`,
    recirc ? "recirculate" : "fresh air",
  ].join("  ·  ");

  const wellFloorShadow =
    "0 4px 0 #050505, 0 7px 7px -2px rgba(0,0,0,.8), 0 15px 20px -6px rgba(0,0,0,.7), 0 26px 32px -12px rgba(0,0,0,.55)";
  const sunkShadow =
    "inset 0 3px 2px rgba(0,0,0,.95), inset 0 12px 18px -4px rgba(0,0,0,.9), inset 0 -3px 6px rgba(0,0,0,.6), inset 0 0 0 1.5px rgba(0,0,0,.8)";
  const sunkBg =
    "radial-gradient(112% 82% at 50% 42%, rgba(0,0,0,0) 34%, rgba(0,0,0,.6) 100%), linear-gradient(180deg, rgba(0,0,0,.62) 0%, rgba(0,0,0,0) 28%)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        padding: "32px 24px",
        boxSizing: "border-box",
        background: "transparent",
        fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif",
        ...style,
      }}
      {...props}
    >
      <div ref={wrapRef} style={{ width: "100%", maxWidth: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ transformOrigin: "center", transform: `scale(${scale})`, width: PANEL_WIDTH }}>
          <div ref={stageRef} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                position: "absolute",
                width: 520,
                height: 120,
                bottom: -34,
                borderRadius: "50%",
                background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 70%)",
                filter: "blur(8px)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                width: PANEL_WIDTH,
                height: 448,
                boxSizing: "border-box",
                padding: 26,
                borderRadius: 62,
                background:
                  "linear-gradient(177deg, #3c3a37 0%, #2b2a28 20%, #221f1e 54%, #171615 86%, #111010 100%)",
                boxShadow:
                  "inset 0 1.5px 0 rgba(255,255,255,.20), inset 0 -2px 2px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.045), 0 1px 2px rgba(0,0,0,.7), 0 20px 26px -16px rgba(0,0,0,.8), 0 44px 64px -30px rgba(0,0,0,.75), 0 90px 70px -56px rgba(0,0,0,.7)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 62,
                  pointerEvents: "none",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.075) 0%, rgba(255,255,255,0) 24%), linear-gradient(90deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0) 90%, rgba(255,255,255,.028) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 62,
                  pointerEvents: "none",
                  boxShadow: "inset 0 0 26px rgba(0,0,0,.5), inset 0 -1px 0 rgba(255,255,255,.05)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 62,
                  pointerEvents: "none",
                  opacity: 0.34,
                  mixBlendMode: "overlay",
                  backgroundImage: noiseOverlay("0.9", 200),
                  backgroundSize: "200px 200px",
                }}
              />

              <div
                style={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns: "196px 196px",
                  gridTemplateRows: "190px 190px",
                  gap: 16,
                }}
              >
                {/* Front defrost */}
                <div
                  style={{
                    gridColumn: 1,
                    gridRow: 1,
                    position: "relative",
                    borderRadius: 66,
                    background: "#0a0a0a",
                    boxShadow: "inset 0 3px 7px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.08), 0 1px 0 rgba(255,255,255,.07)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 3,
                      borderRadius: 63,
                      pointerEvents: "none",
                      background: "#090909",
                      transition: "opacity 140ms linear",
                      boxShadow: wellFloorShadow,
                      opacity: liftOpacity(defrost, dPressed),
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Front defrost"
                    aria-pressed={defrost}
                    onPointerDown={() => down("defrost")}
                    onPointerUp={liftUp}
                    onPointerLeave={liftUp}
                    onPointerCancel={liftUp}
                    onKeyDown={keyDown("defrost")}
                    onKeyUp={liftUp}
                    onBlur={liftUp}
                    onClick={toggleDefrost}
                    className="ccp-well-btn"
                    style={{
                      position: "absolute",
                      inset: 3,
                      borderRadius: 63,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 15,
                      background: "linear-gradient(178deg, #3a3835 0%, #2b2927 26%, #201f1e 66%, #191817 100%)",
                      transform: formTransform(defrost, dPressed),
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        borderRadius: 63,
                        transition: "opacity 140ms linear",
                        background:
                          "radial-gradient(120% 66% at 50% -12%, rgba(255,255,255,.12) 0%, rgba(255,255,255,0) 58%), linear-gradient(0deg, rgba(255,255,255,.055) 0%, rgba(255,255,255,0) 16%)",
                        opacity: liftOpacity(defrost, dPressed),
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        borderRadius: 63,
                        opacity: 0.3,
                        mixBlendMode: "overlay",
                        backgroundImage: noiseOverlay("1.1", 160),
                        backgroundSize: "160px 160px",
                      }}
                    />
                    {(defrost || dPressed) && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          borderRadius: 63,
                          animation: "ccp-sink-in 150ms ease-out both",
                          boxShadow: sunkShadow,
                          background: sunkBg,
                        }}
                      />
                    )}

                    <div
                      style={{
                        position: "relative",
                        width: 42,
                        height: 12,
                        borderRadius: 6,
                        background: "#0c0c0c",
                        boxShadow: "inset 0 1.5px 2.5px rgba(0,0,0,.9), inset 0 -0.5px 0 rgba(255,255,255,.09), 0 1px 0 rgba(255,255,255,.07)",
                      }}
                    >
                      <div style={{ position: "absolute", inset: 2, borderRadius: 4, background: "linear-gradient(180deg, #46443f 0%, #33312d 100%)" }} />
                      <div
                        style={{
                          position: "absolute",
                          inset: 2,
                          borderRadius: 4,
                          background: "linear-gradient(180deg, #ffd27a 0%, #ffab1c 55%, #d9820a 100%)",
                          boxShadow: "0 0 8px rgba(255,168,26,.75), 0 0 20px rgba(255,150,20,.45), inset 0 -1px 1px rgba(0,0,0,.35)",
                          opacity: defrost ? 1 : 0,
                          transition: "opacity 150ms ease",
                        }}
                      />
                    </div>

                    <div style={{ position: "relative", lineHeight: 0, filter: "drop-shadow(0 1.5px 0 rgba(0,0,0,.7))", color: inkColor(defrost) }}>
                      <svg width="84" height="84" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 26,5 h 15 v 2.5 a 3.5,3.5 0 0 0 3.5,3.5 h 11 a 3.5,3.5 0 0 0 3.5,-3.5 v -2.5 h 15 c 4,0 6.5,2 7.5,5.5 l 10,39 c 1.3,5 -1.6,8.5 -6.5,8.5 h -70 c -4.9,0 -7.8,-3.5 -6.5,-8.5 l 10,-39 c 1,-3.5 3.5,-5.5 7.5,-5.5 z" />
                        <path d="M 28,94 c 4,-7 -4,-12 0,-19 c 4,-7 -4,-12 0,-18 L 28,30" />
                        <path d="M 21,38 L 28,30 L 35,38" />
                        <path d="M 50,94 c 4,-7 -4,-12 0,-19 c 4,-7 -4,-12 0,-18 L 50,30" />
                        <path d="M 43,38 L 50,30 L 57,38" />
                        <path d="M 72,94 c 4,-7 -4,-12 0,-19 c 4,-7 -4,-12 0,-18 L 72,30" />
                        <path d="M 65,38 L 72,30 L 79,38" />
                      </svg>
                    </div>
                  </button>
                </div>

                {/* A/C */}
                <div
                  style={{
                    gridColumn: 1,
                    gridRow: 2,
                    position: "relative",
                    borderRadius: 66,
                    background: "#0a0a0a",
                    boxShadow: "inset 0 3px 7px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.08), 0 1px 0 rgba(255,255,255,.07)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 3,
                      borderRadius: 63,
                      pointerEvents: "none",
                      background: "#090909",
                      transition: "opacity 140ms linear",
                      boxShadow: wellFloorShadow,
                      opacity: liftOpacity(ac, aPressed),
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Air conditioning"
                    aria-pressed={ac}
                    onPointerDown={() => down("ac")}
                    onPointerUp={liftUp}
                    onPointerLeave={liftUp}
                    onPointerCancel={liftUp}
                    onKeyDown={keyDown("ac")}
                    onKeyUp={liftUp}
                    onBlur={liftUp}
                    onClick={toggleAc}
                    className="ccp-well-btn"
                    style={{
                      position: "absolute",
                      inset: 3,
                      borderRadius: 63,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 18,
                      background: "linear-gradient(178deg, #3a3835 0%, #2b2927 26%, #201f1e 66%, #191817 100%)",
                      transform: formTransform(ac, aPressed),
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        borderRadius: 63,
                        transition: "opacity 140ms linear",
                        background:
                          "radial-gradient(120% 66% at 50% -12%, rgba(255,255,255,.12) 0%, rgba(255,255,255,0) 58%), linear-gradient(0deg, rgba(255,255,255,.055) 0%, rgba(255,255,255,0) 16%)",
                        opacity: liftOpacity(ac, aPressed),
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        borderRadius: 63,
                        opacity: 0.3,
                        mixBlendMode: "overlay",
                        backgroundImage: noiseOverlay("1.1", 160),
                        backgroundSize: "160px 160px",
                      }}
                    />
                    {(ac || aPressed) && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          borderRadius: 63,
                          animation: "ccp-sink-in 150ms ease-out both",
                          boxShadow: sunkShadow,
                          background: sunkBg,
                        }}
                      />
                    )}

                    <div
                      style={{
                        position: "relative",
                        width: 46,
                        height: 13,
                        borderRadius: 6.5,
                        background: "#0c0c0c",
                        boxShadow: "inset 0 1.5px 2.5px rgba(0,0,0,.9), inset 0 -0.5px 0 rgba(255,255,255,.09), 0 1px 0 rgba(255,255,255,.07)",
                      }}
                    >
                      <div style={{ position: "absolute", inset: 2, borderRadius: 4.5, background: "linear-gradient(180deg, #3c443c 0%, #2b312b 100%)" }} />
                      <div
                        style={{
                          position: "absolute",
                          inset: 2,
                          borderRadius: 4.5,
                          boxShadow: "0 0 9px rgba(46,220,70,.7), 0 0 22px rgba(40,210,64,.42), inset 0 -1px 1px rgba(0,0,0,.35), inset 0 1px 1px rgba(255,255,255,.3)",
                          background: `linear-gradient(180deg, #9dff92 0%, ${ledColor} 52%, #12a324 100%)`,
                          opacity: ac ? 1 : 0,
                          transition: "opacity 150ms ease",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        position: "relative",
                        font: "500 54px/1 'Geist', ui-sans-serif, sans-serif",
                        letterSpacing: "-0.015em",
                        textShadow: "0 1.5px 0 rgba(0,0,0,.7)",
                        color: inkColor(ac),
                      }}
                    >
                      A/C
                    </div>
                  </button>
                </div>

                {/* Air intake */}
                <div
                  role="radiogroup"
                  aria-label="Air intake"
                  style={{
                    gridColumn: 2,
                    gridRow: "1 / span 2",
                    position: "relative",
                    borderRadius: 66,
                    background: "#0a0a0a",
                    boxShadow: "inset 0 3px 7px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.08), 0 1px 0 rgba(255,255,255,.07)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: 3,
                      right: 3,
                      height: 193,
                      borderRadius: "63px 63px 14px 14px",
                      pointerEvents: "none",
                      background: "#090909",
                      transition: "opacity 140ms linear",
                      boxShadow: wellFloorShadow,
                      opacity: liftOpacity(fresh, fPressed),
                    }}
                  />
                  <button
                    ref={freshRef}
                    type="button"
                    role="radio"
                    aria-label="Fresh air"
                    aria-checked={fresh}
                    tabIndex={fresh ? 0 : -1}
                    onPointerDown={() => down("fresh")}
                    onPointerUp={liftUp}
                    onPointerLeave={liftUp}
                    onPointerCancel={liftUp}
                    onKeyDown={onIntakeKeyDown("fresh")}
                    onKeyUp={liftUp}
                    onBlur={liftUp}
                    onClick={() => selectIntake("fresh")}
                    className="ccp-well-btn"
                    style={{
                      position: "absolute",
                      top: 3,
                      left: 3,
                      right: 3,
                      height: 193,
                      borderRadius: "63px 63px 14px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(178deg, #3a3835 0%, #2c2a29 30%, #222120 78%, #1d1c1b 100%)",
                      transform: formTransform(fresh, fPressed),
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        borderRadius: "63px 63px 14px 14px",
                        transition: "opacity 140ms linear",
                        background: "radial-gradient(110% 50% at 50% -8%, rgba(255,255,255,.12) 0%, rgba(255,255,255,0) 60%)",
                        opacity: liftOpacity(fresh, fPressed),
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        borderRadius: "63px 63px 14px 14px",
                        opacity: 0.3,
                        mixBlendMode: "overlay",
                        backgroundImage: noiseOverlay("1.1", 160),
                        backgroundSize: "160px 160px",
                      }}
                    />
                    {(fresh || fPressed) && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          borderRadius: "63px 63px 14px 14px",
                          animation: "ccp-sink-in 150ms ease-out both",
                          boxShadow: sunkShadow,
                          background: sunkBg,
                        }}
                      />
                    )}
                    <div style={{ position: "relative", lineHeight: 0, marginTop: 6, filter: "drop-shadow(0 1.5px 0 rgba(0,0,0,.7))", color: inkColor(fresh) }}>
                      <svg width="116" height="58" viewBox="0 0 132 66" fill="none" stroke="currentColor" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 5,40 c 0,4 2,6 6,6 h 7 v 6 a 6,6 0 0 0 6,6 h 11 a 6,6 0 0 0 6,-6 v -6 h 45 v 6 a 6,6 0 0 0 6,6 h 11 a 6,6 0 0 0 6,-6 v -6 h 9 c 5,0 8,-2 8,-7 v -13 c 0,-5 -2,-7 -6,-9 l -14,-11 c -3,-2 -5,-3 -9,-3 h -44 c -4,0 -6,1 -8,3.5 l -13,20 l -18,3 c -6,1 -9,4 -9,10.5 z" />
                        <path d="M 96,13 h -30 c -5,0 -6,4 -11,4 h -36" stroke="#2a2827" strokeWidth={10} />
                        <path d="M 96,13 h -30 c -5,0 -6,4 -11,4 h -36" />
                        <path d="M -9,-6.5 L 0,0 L -9,6.5" transform="translate(11,17) rotate(180)" />
                      </svg>
                    </div>
                  </button>

                  <div
                    style={{
                      position: "absolute",
                      bottom: 3,
                      left: 3,
                      right: 3,
                      height: 193,
                      borderRadius: "14px 14px 63px 63px",
                      pointerEvents: "none",
                      background: "#090909",
                      transition: "opacity 140ms linear",
                      boxShadow: wellFloorShadow,
                      opacity: liftOpacity(recirc, rPressed),
                    }}
                  />
                  <button
                    ref={recircRef}
                    type="button"
                    role="radio"
                    aria-label="Recirculate"
                    aria-checked={recirc}
                    tabIndex={recirc ? 0 : -1}
                    onPointerDown={() => down("recirc")}
                    onPointerUp={liftUp}
                    onPointerLeave={liftUp}
                    onPointerCancel={liftUp}
                    onKeyDown={onIntakeKeyDown("recirc")}
                    onKeyUp={liftUp}
                    onBlur={liftUp}
                    onClick={() => selectIntake("recirc")}
                    className="ccp-well-btn ccp-well-btn--recirc"
                    style={{
                      position: "absolute",
                      bottom: 3,
                      left: 3,
                      right: 3,
                      height: 193,
                      borderRadius: "14px 14px 63px 63px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(178deg, #343231 0%, #2a2827 22%, #201f1e 72%, #1a1918 100%)",
                      transform: formTransform(recirc, rPressed),
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        borderRadius: "14px 14px 63px 63px",
                        transition: "opacity 140ms linear",
                        background:
                          "radial-gradient(110% 46% at 50% -6%, rgba(255,255,255,.08) 0%, rgba(255,255,255,0) 60%), linear-gradient(0deg, rgba(255,255,255,.055) 0%, rgba(255,255,255,0) 14%)",
                        opacity: liftOpacity(recirc, rPressed),
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        borderRadius: "14px 14px 63px 63px",
                        opacity: 0.3,
                        mixBlendMode: "overlay",
                        backgroundImage: noiseOverlay("1.1", 160),
                        backgroundSize: "160px 160px",
                      }}
                    />
                    {(recirc || rPressed) && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          borderRadius: "14px 14px 63px 63px",
                          animation: "ccp-sink-in 150ms ease-out both",
                          boxShadow: sunkShadow,
                          background: sunkBg,
                        }}
                      />
                    )}
                    <div style={{ position: "relative", lineHeight: 0, marginTop: -4, filter: "drop-shadow(0 1.5px 0 rgba(0,0,0,.7))", color: inkColor(recirc) }}>
                      <svg width="114" height="57" viewBox="0 0 132 66" fill="none" stroke="currentColor" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 5,38 c 0,4 2,6 6,6 h 11 v 6 a 6,6 0 0 0 6,6 h 10 a 6,6 0 0 0 6,-6 v -6 h 44 v 6 a 6,6 0 0 0 6,6 h 10 a 6,6 0 0 0 6,-6 v -6 h 11 c 4,0 6,-2 6,-6 v -8 c 0,-4 -2,-5 -5,-6 l -16,-13 c -2,-2 -4,-3 -7,-3 h -30 c -3,0 -5,1 -7,2.5 l -20,14 l -22,3 c -8,1 -12,4 -12,10.5 z" />
                        <path d="M 46,18 h 20 a 7,7 0 0 1 7,7 a 7,7 0 0 0 7,7 h 2" stroke="#232120" strokeWidth={9.5} />
                        <path d="M 46,18 h 20 a 7,7 0 0 1 7,7 a 7,7 0 0 0 7,7 h 2" />
                        <path d="M -9,-6.5 L 0,0 L -9,6.5" transform="translate(88,32)" />
                      </svg>
                    </div>
                  </button>

                  <div
                    style={{
                      position: "absolute",
                      left: 16,
                      right: 16,
                      top: 196,
                      height: 4,
                      pointerEvents: "none",
                      borderRadius: 2,
                      background: "linear-gradient(180deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.75) 60%, rgba(255,255,255,.06) 100%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showStatus && (
        <div
          style={{
            font: "400 11px/1 'Geist Mono', ui-monospace, monospace",
            letterSpacing: ".16em",
            color: "#8d8a85",
            textTransform: "uppercase",
          }}
        >
          {statusLine}
        </div>
      )}
    </div>
  );
}
