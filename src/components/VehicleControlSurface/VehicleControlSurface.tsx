"use client";

import React, { type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { VehicleStage } from "./VehicleStage";
import "./styles.css";

export interface VehicleControlState {
  locked: boolean;
  climateOn: boolean;
  charging: boolean;
  sentry: boolean;
  batteryDetailOpen: boolean;
}

type ControlKey = keyof VehicleControlState;

export interface VehicleModelOption {
  id: string;
  name: string;
  tag?: string;
}

export interface VehicleControlSurfaceProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Name shown in the header. */
  vehicleName?: string;
  /** Optional list of other vehicles the header dropdown can switch between. */
  models?: VehicleModelOption[];
  /** Called when the user picks a different vehicle from the header dropdown. */
  onVehicleChange?: (model: VehicleModelOption) => void;

  /** Current battery level, 0-100. Controlled — pass this to drive it from live telemetry. */
  batteryLevel?: number;
  /** Starting battery level when uncontrolled (no `batteryLevel` passed). Ticks upward while charging. */
  defaultBatteryLevel?: number;
  /** Baseline status label shown when idle, e.g. "Parked". */
  status?: string;
  /** Estimated range in km. Defaults to a projection from the battery level. */
  rangeKm?: number;
  /** Charge limit shown in the battery detail readout, as a percent. */
  chargeLimitPercent?: number;
  /** Pack temperature shown in the battery detail readout, in °C. */
  packTempC?: number;
  /** Cabin target temperature shown in the status line while climate is on, in °C. */
  cabinTargetC?: number;
  /** Charge rate shown in the status line while charging, in kW. */
  chargingPowerKw?: number;
  /** Body paint color for the 3D vehicle, any CSS hex color. */
  paintColor?: string;

  defaultLocked?: boolean;
  defaultClimateOn?: boolean;
  defaultCharging?: boolean;
  defaultSentry?: boolean;
  defaultBatteryDetailOpen?: boolean;

  /** Enable the procedural control-press click sound. */
  sound?: boolean;
  /** Enable haptic feedback (vibration) on press, where supported. */
  haptics?: boolean;

  /** Called whenever lock, climate, charging, sentry, or the battery detail drawer changes. */
  onChange?: (state: VehicleControlState) => void;
  onMessagesClick?: () => void;
  onMenuClick?: () => void;
}

function hexToInt(hex: string): number {
  const clean = hex.replace("#", "");
  const parsed = Number.parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return Number.isNaN(parsed) ? 0x121519 : parsed;
}

function ChevronIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-8 8H4.6a.6.6 0 0 1-.42-1.02L6 17.2A8 8 0 1 1 21 12z" />
      <circle cx="8.6" cy="12" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="15.4" cy="12" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.2" y="10.4" width="15.6" height="10.4" rx="2.6" />
      <path d={locked ? "M8 10.4V7.6a4 4 0 0 1 8 0v2.8" : "M8 10.4V7.6a4 4 0 0 1 7.6-1.6"} />
    </svg>
  );
}

function ClimateIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round">
      <g className="vcs-fanblades" data-spin={spinning}>
        <path d="M12 11.2c0-3.4.7-6.2 2.6-7.1 1.7-.8 3.3.5 3.3 2.3 0 2.6-2.7 4.4-5.9 4.8z" />
        <path d="M12.8 12.4c2.9 1.7 4.8 3.9 4.4 6-.4 1.8-2.4 2.5-3.9 1.5-2.2-1.3-2.3-4.6-.5-7.5z" />
        <path d="M11.2 12.4c-2.9 1.7-5.5 2.3-7 1-1.4-1.2-1-3.3.6-4.1 2.3-1.2 5 .6 6.4 3.1z" />
      </g>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChargeIcon() {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M13.9 2.2 5.6 13.1c-.4.5 0 1.2.6 1.2h4.2l-1.4 7.4c-.1.6.7 1 1.1.5l8.4-11c.4-.5 0-1.2-.6-1.2h-4.2l1.3-7.3c.1-.6-.7-1-1.1-.5z" />
    </svg>
  );
}

function SentryIcon({ armed }: { armed: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <circle cx="12" cy="12" r="9.1" />
      <circle cx="12" cy="12" r="5" fill={armed ? "#ff3b28" : "currentColor"} stroke="none" opacity={armed ? 1 : 0.55} />
    </svg>
  );
}

function BatteryIcon({ level }: { level: number }) {
  const fillWidth = (1.6 + 12.4 * Math.max(0, Math.min(100, level)) / 100).toFixed(1);
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
      <rect x="2.6" y="8.2" width="17" height="7.6" rx="2.2" />
      <path d="M21.4 11v2" strokeLinecap="round" strokeWidth={2.6} />
      <rect x="4.6" y="10.2" width={fillWidth} height="3.6" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface ControlCapProps {
  ariaLabel: string;
  active: boolean;
  pressed: boolean;
  ledGradient: string;
  ledGlow: string;
  lamp: string;
  halo: string;
  onDown: () => void;
  onCapKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  onUp: () => void;
  onCapClick: () => void;
  children: ReactNode;
}

function ControlCap({ ariaLabel, active, pressed, ledGradient, ledGlow, lamp, halo, onDown, onCapKeyDown, onUp, onCapClick, children }: ControlCapProps) {
  const vars = { "--vcs-lamp": lamp, "--vcs-halo": halo } as CSSProperties;
  const ledVars = { "--vcs-led": ledGradient, "--vcs-ledglow": ledGlow } as CSSProperties;
  return (
    <div className="vcs-well">
      <div className="vcs-floor" />
      <button
        type="button"
        className="vcs-cap"
        aria-label={ariaLabel}
        aria-pressed={active}
        data-pressed={pressed}
        style={vars}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerCancel={onUp}
        onKeyDown={onCapKeyDown}
        onKeyUp={onUp}
        onBlur={onUp}
        onClick={onCapClick}
      >
        <span className="vcs-sheen" />
        <span className="vcs-grain" />
        <span className="vcs-sunk" />
        <span className="vcs-lamp" />
        <span className="vcs-led" style={ledVars}>
          <i />
        </span>
        <span className="vcs-ico">{children}</span>
      </button>
    </div>
  );
}

export default function VehicleControlSurface({
  vehicleName = "Vega EX",
  models,
  onVehicleChange,
  batteryLevel,
  defaultBatteryLevel = 82,
  status = "Parked",
  rangeKm,
  chargeLimitPercent = 90,
  packTempC = 24,
  cabinTargetC = 21,
  chargingPowerKw = 11.2,
  paintColor = "#121519",
  defaultLocked = true,
  defaultClimateOn = false,
  defaultCharging = false,
  defaultSentry = false,
  defaultBatteryDetailOpen = false,
  sound = true,
  haptics = true,
  onChange,
  onMessagesClick,
  onMenuClick,
  className,
  style,
  ...props
}: VehicleControlSurfaceProps) {
  const [locked, setLocked] = React.useState(defaultLocked);
  const [climateOn, setClimateOn] = React.useState(defaultClimateOn);
  const [charging, setCharging] = React.useState(defaultCharging);
  const [sentry, setSentry] = React.useState(defaultSentry);
  const [batteryDetailOpen, setBatteryDetailOpen] = React.useState(defaultBatteryDetailOpen);
  const [pressed, setPressed] = React.useState<ControlKey | null>(null);
  const [flashToken, setFlashToken] = React.useState(0);
  const [transientText, setTransientText] = React.useState<string | null>(null);
  const [modelOpen, setModelOpen] = React.useState(false);

  const isBatteryControlled = batteryLevel !== undefined;
  const [internalBattery, setInternalBattery] = React.useState(defaultBatteryLevel);
  const level = isBatteryControlled ? (batteryLevel as number) : internalBattery;

  const transientTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const noiseBufferRef = React.useRef<AudioBuffer | null>(null);

  React.useEffect(() => {
    if (isBatteryControlled || !charging) return;
    const id = setInterval(() => {
      setInternalBattery((v) => Math.min(chargeLimitPercent, v + 0.4));
    }, 1400);
    return () => clearInterval(id);
  }, [isBatteryControlled, charging, chargeLimitPercent]);

  React.useEffect(() => {
    return () => {
      if (transientTimeout.current) clearTimeout(transientTimeout.current);
      audioContextRef.current?.close?.();
    };
  }, []);

  React.useEffect(() => {
    if (!modelOpen) return;
    const close = () => setModelOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [modelOpen]);

  const showTransient = (text: string) => {
    if (transientTimeout.current) clearTimeout(transientTimeout.current);
    setTransientText(text);
    transientTimeout.current = setTimeout(() => setTransientText(null), 1600);
  };

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
      bp.frequency.value = (down ? 2200 : 2900) * v;
      bp.Q.value = 1.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.14 * v * amp, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      src.connect(bp);
      bp.connect(g);
      g.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.1);

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime((down ? 150 : 190) * v, now);
      osc.frequency.exponentialRampToValueAtTime(88, now + 0.05);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.13 * v * amp, now);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      osc.connect(og);
      og.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      /* noop: sound is best-effort */
    }
  };

  const down = (key: ControlKey) => {
    if (pressed === key) return;
    playClick(true);
    if (haptics && navigator.vibrate) {
      try {
        navigator.vibrate(9);
      } catch {
        /* noop */
      }
    }
    setPressed(key);
  };

  const liftUp = () => {
    if (pressed === null) return;
    playClick(false);
    setPressed(null);
  };

  const capKeyDown = (key: ControlKey) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.repeat) return;
    if (e.key === " " || e.key === "Enter" || e.key === "Spacebar") down(key);
  };

  const toggle = (key: ControlKey) => {
    const next: VehicleControlState = { locked, climateOn, charging, sentry, batteryDetailOpen, [key]: !{ locked, climateOn, charging, sentry, batteryDetailOpen }[key] };
    setLocked(next.locked);
    setClimateOn(next.climateOn);
    setCharging(next.charging);
    setSentry(next.sentry);
    setBatteryDetailOpen(next.batteryDetailOpen);
    onChange?.(next);
    if (key === "locked") {
      setFlashToken((t) => t + 1);
      showTransient(next.locked ? "Locked" : "Unlocked");
    }
  };

  const displayRangeKm = rangeKm ?? Math.round(level * 4.72);
  const minutesToLimit = Math.max(0, Math.round(58 - level * 0.5));
  const cellFillWidth = (2.5 + 41 * Math.max(0, Math.min(100, level)) / 100).toFixed(1);

  let statusNode: ReactNode;
  if (transientText) {
    statusNode = <b>{transientText}</b>;
  } else if (charging) {
    statusNode = (
      <>
        Charging · <b>{chargingPowerKw}kW</b> · {minutesToLimit} min to {chargeLimitPercent}%
      </>
    );
  } else if (climateOn) {
    statusNode = (
      <>
        {status} · <b>Cabin {cabinTargetC}°</b>
      </>
    );
  } else if (sentry) {
    statusNode = (
      <>
        {status} · <b>Sentry armed</b>
      </>
    );
  } else {
    statusNode = status;
  }

  const hasModels = (models?.length ?? 0) > 1;

  return (
    <div className={cn("vcs-root", className)} style={style} {...props}>
      <header className="vcs-header">
        <div className="vcs-row">
          <button
            type="button"
            className="vcs-model"
            data-open={modelOpen}
            data-interactive={hasModels}
            aria-haspopup={hasModels ? "menu" : undefined}
            aria-expanded={hasModels ? modelOpen : undefined}
            onClick={
              hasModels
                ? (e) => {
                    e.stopPropagation();
                    setModelOpen(!modelOpen);
                  }
                : undefined
            }
          >
            <span>{vehicleName}</span>
            {hasModels && <ChevronIcon />}
          </button>
          <div className="vcs-spacer" />
          <button type="button" className="vcs-gbtn" aria-label="Messages" onClick={onMessagesClick}>
            <MessagesIcon />
          </button>
          <button type="button" className="vcs-gbtn" aria-label="Menu" onClick={onMenuClick}>
            <MenuIcon />
          </button>
        </div>

        <div className="vcs-meta">
          <div className="vcs-cell">
            <div className={cn("vcs-cellfill", charging && "vcs-charging")} style={{ width: `${cellFillWidth}px` }} />
          </div>
          <div className="vcs-pct">{Math.round(level)}%</div>
        </div>

        <div className="vcs-status" aria-live="polite">
          {statusNode}
        </div>

        {hasModels && (
          <div className="vcs-picker" data-open={modelOpen} role="menu">
            {models!.map((m) => (
              <button
                key={m.id}
                type="button"
                role="menuitem"
                aria-current={m.name === vehicleName}
                onClick={(e) => {
                  e.stopPropagation();
                  onVehicleChange?.(m);
                  setModelOpen(false);
                }}
              >
                {m.name}
                {m.tag && <span>{m.tag}</span>}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="vcs-stage">
        <VehicleStage
          paintColor={hexToInt(paintColor)}
          charging={charging}
          sentry={sentry}
          flashToken={flashToken}
        />
        <dl className="vcs-readout" data-open={batteryDetailOpen}>
          <div>
            <dt>Range</dt>
            <dd>
              {displayRangeKm}
              <em>km</em>
            </dd>
          </div>
          <div>
            <dt>Charge limit</dt>
            <dd>
              {chargeLimitPercent}
              <em>%</em>
            </dd>
          </div>
          <div>
            <dt>Pack temp</dt>
            <dd>
              {packTempC}
              <em>°C</em>
            </dd>
          </div>
        </dl>
      </div>

      <div className="vcs-dock">
        <div className="vcs-keys" role="group" aria-label="Vehicle controls">
          <ControlCap
            ariaLabel="Lock"
            active={locked}
            pressed={pressed === "locked"}
            ledGradient="linear-gradient(180deg,#dfe8ff 0%,#9fb6e8 55%,#6d83b8 100%)"
            ledGlow="rgba(180,205,255,.7)"
            lamp="rgba(210,225,255,.14)"
            halo="rgba(200,220,255,.45)"
            onDown={() => down("locked")}
            onCapKeyDown={capKeyDown("locked")}
            onUp={liftUp}
            onCapClick={() => toggle("locked")}
          >
            <LockIcon locked={locked} />
          </ControlCap>

          <ControlCap
            ariaLabel="Climate"
            active={climateOn}
            pressed={pressed === "climateOn"}
            ledGradient="linear-gradient(180deg,#bfe9ff 0%,#4ab6f0 55%,#2382b5 100%)"
            ledGlow="rgba(74,182,240,.75)"
            lamp="rgba(160,215,255,.15)"
            halo="rgba(150,205,255,.5)"
            onDown={() => down("climateOn")}
            onCapKeyDown={capKeyDown("climateOn")}
            onUp={liftUp}
            onCapClick={() => toggle("climateOn")}
          >
            <ClimateIcon spinning={climateOn} />
          </ControlCap>

          <ControlCap
            ariaLabel="Charging"
            active={charging}
            pressed={pressed === "charging"}
            ledGradient="linear-gradient(180deg,#8dfba6 0%,#2edc46 55%,#18a231 100%)"
            ledGlow="rgba(46,220,70,.8)"
            lamp="rgba(46,220,70,.15)"
            halo="rgba(46,220,70,.55)"
            onDown={() => down("charging")}
            onCapKeyDown={capKeyDown("charging")}
            onUp={liftUp}
            onCapClick={() => toggle("charging")}
          >
            <ChargeIcon />
          </ControlCap>

          <ControlCap
            ariaLabel="Sentry mode"
            active={sentry}
            pressed={pressed === "sentry"}
            ledGradient="linear-gradient(180deg,#ffb1a6 0%,#ff3b28 55%,#b81c0e 100%)"
            ledGlow="rgba(255,59,40,.8)"
            lamp="rgba(255,60,50,.14)"
            halo="rgba(255,70,55,.5)"
            onDown={() => down("sentry")}
            onCapKeyDown={capKeyDown("sentry")}
            onUp={liftUp}
            onCapClick={() => toggle("sentry")}
          >
            <SentryIcon armed={sentry} />
          </ControlCap>

          <ControlCap
            ariaLabel="Battery detail"
            active={batteryDetailOpen}
            pressed={pressed === "batteryDetailOpen"}
            ledGradient="linear-gradient(180deg,#f2f3f2 0%,#c2c5c3 55%,#8e918f 100%)"
            ledGlow="rgba(230,235,232,.6)"
            lamp="rgba(220,225,230,.13)"
            halo="rgba(225,230,235,.4)"
            onDown={() => down("batteryDetailOpen")}
            onCapKeyDown={capKeyDown("batteryDetailOpen")}
            onUp={liftUp}
            onCapClick={() => toggle("batteryDetailOpen")}
          >
            <BatteryIcon level={level} />
          </ControlCap>
        </div>

        <div className="vcs-caption">
          <span data-on={locked}>{locked ? "Locked" : "Unlocked"}</span>
          <span data-on={climateOn}>Climate</span>
          <span data-on={charging}>Charge</span>
          <span data-on={sentry}>Sentry</span>
          <span data-on={batteryDetailOpen}>Battery</span>
        </div>
      </div>
    </div>
  );
}
