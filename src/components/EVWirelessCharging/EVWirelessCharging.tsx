"use client";

import React, { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { ChargingStage } from "./ChargingStage";
import "./styles.css";

export interface EVWirelessChargingProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Header title. */
  title?: string;
  /** Hours until the pack reaches full charge, used for the default subtitle text. */
  hoursRemaining?: number;
  /** Override for the subtitle under the title (defaults to "{hoursRemaining} hrs remaining"). */
  remainingLabel?: string;

  /** Estimated driving range, shown as the large central number. */
  rangeKm?: number;
  /** Unit label next to the range value. */
  rangeUnit?: string;

  /** Current battery level, 0-100. Controlled — pass this to drive it from live telemetry. */
  batteryLevel?: number;
  /** Starting battery level when uncontrolled. Ticks upward while charging. */
  defaultBatteryLevel?: number;
  /** Number of segmented cells in the battery pack readout. */
  cellCount?: number;

  /** Whether charging is active. Controlled — pass this with onChargingChange to own the state. */
  charging?: boolean;
  /** Initial charging state when uncontrolled. */
  defaultCharging?: boolean;
  /** Called whenever the Start/Stop Charging button is pressed. */
  onChargingChange?: (charging: boolean) => void;
  /** Label on the button while charging is active. */
  stopLabel?: string;
  /** Label on the button while charging is inactive. */
  startLabel?: string;

  /** Body paint color for the 3D vehicle, any CSS hex color. */
  paintColor?: string;
  /** Enable the procedural button-press click sound. */
  sound?: boolean;
  /** Enable haptic feedback (vibration) on press, where supported. */
  haptics?: boolean;
}

function hexToInt(hex: string): number {
  const clean = hex.replace("#", "");
  const parsed = Number.parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return Number.isNaN(parsed) ? 0x3b444c : parsed;
}

export default function EVWirelessCharging({
  title = "Wireless Charging",
  hoursRemaining = 12,
  remainingLabel,
  rangeKm = 127,
  rangeUnit = "km",
  batteryLevel,
  defaultBatteryLevel = 32,
  cellCount = 16,
  charging,
  defaultCharging = true,
  onChargingChange,
  stopLabel = "Stop Charging",
  startLabel = "Start Charging",
  paintColor = "#3b444c",
  sound = true,
  haptics = true,
  className,
  style,
  ...props
}: EVWirelessChargingProps) {
  const isChargingControlled = charging !== undefined;
  const [internalCharging, setInternalCharging] = React.useState(defaultCharging);
  const isCharging = isChargingControlled ? (charging as boolean) : internalCharging;

  const isBatteryControlled = batteryLevel !== undefined;
  const [internalBattery, setInternalBattery] = React.useState(defaultBatteryLevel);
  const level = Math.max(0, Math.min(100, isBatteryControlled ? (batteryLevel as number) : internalBattery));

  const [pressed, setPressed] = React.useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const noiseBufferRef = React.useRef<AudioBuffer | null>(null);

  React.useEffect(() => {
    if (isBatteryControlled || !isCharging) return;
    const id = setInterval(() => {
      setInternalBattery((v) => Math.min(100, v + 0.4));
    }, 1400);
    return () => clearInterval(id);
  }, [isBatteryControlled, isCharging]);

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

  const playClick = (down: boolean) => {
    if (!sound) return;
    const ctx = getAudioContext();
    const noise = noiseBufferRef.current;
    if (!ctx || !noise) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const v = 0.9 + Math.random() * 0.2;
      const amp = down ? 1 : 0.45;

      const src = ctx.createBufferSource();
      src.buffer = noise;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = (down ? 2100 : 2800) * v;
      bp.Q.value = 1.1;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.15 * v * amp, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      src.connect(bp);
      bp.connect(g);
      g.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.1);

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime((down ? 140 : 175) * v, now);
      osc.frequency.exponentialRampToValueAtTime(82, now + 0.06);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.14 * v * amp, now);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(og);
      og.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      /* noop: sound is best-effort */
    }
  };

  const down = () => {
    if (pressed) return;
    playClick(true);
    if (haptics && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        /* noop */
      }
    }
    setPressed(true);
  };

  const up = () => {
    if (!pressed) return;
    playClick(false);
    setPressed(false);
  };

  const toggleCharging = () => {
    const next = !isCharging;
    if (!isChargingControlled) setInternalCharging(next);
    onChargingChange?.(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.repeat) return;
    if (e.key === " " || e.key === "Enter" || e.key === "Spacebar") down();
  };

  const cellsLit = Math.round((level / 100) * cellCount);
  const cells = Array.from({ length: cellCount }, (_, i) => ({
    on: i < cellsLit,
    tip: i === cellsLit - 1,
  }));

  const subtitle = remainingLabel ?? `${hoursRemaining} hrs remaining`;

  return (
    <div className={cn("evc-root", className)} style={style} {...props}>
      <div className="evc-stage">
        <ChargingStage paintColor={hexToInt(paintColor)} charging={isCharging} />
      </div>

      <div className="evc-ui">
        <div className="evc-head">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="evc-range">
          <b>{Math.round(rangeKm)}</b>
          <span>{rangeUnit}</span>
        </div>

        <div className="evc-pack">
          <div className="evc-well">
            {cells.map((cell, i) => (
              <div key={i} className={cn("evc-cell", cell.on && "evc-on", cell.on && cell.tip && "evc-tip")} />
            ))}
          </div>
          <div className="evc-pct">{Math.round(level)}%</div>
        </div>
        <div className="evc-marker" />

        <button
          type="button"
          className="evc-btn"
          aria-pressed={isCharging}
          data-pressed={pressed}
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
          onKeyDown={onKeyDown}
          onKeyUp={up}
          onBlur={up}
          onClick={toggleCharging}
        >
          {isCharging ? stopLabel : startLabel}
        </button>
      </div>
    </div>
  );
}
