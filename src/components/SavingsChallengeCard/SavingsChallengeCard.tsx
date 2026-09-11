"use client";

import { CaretDoubleRightIcon, PlusIcon, UserIcon } from "@phosphor-icons/react";
import { animate } from "motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DotMatrix } from "./dot-matrix";

export interface SavingsChallengeParticipant {
  /** Full display name. Used for the roster row and the avatar title/alt text. */
  name: string;
  /** Photo URL. When omitted, the avatar falls back to initials. */
  src?: string;
  /** Overrides the initials derived from name. */
  initials?: string;
  /** This person's contribution. Shown in the roster drawer. */
  amount?: number;
  /** Tint for the initials fallback text. */
  tint?: string;
}

export interface SavingsChallengeCardProps {
  className?: string;
  /** Asset / challenge name, centred in the header. */
  title?: string;
  /** Sub-line under the title. */
  duration?: string;
  /** Saved so far. Controlled: changing it counts the readout up and redraws the curve. */
  amount?: number;
  /** Target amount. Drives the remaining figure and, unless progress is set, the curve. */
  goal?: number;
  /** 0-1 override for progress, for when it is not a simple amount/goal ratio. */
  progress?: number;
  /** ISO 4217 currency code, formatted via Intl.NumberFormat. */
  currency?: string;
  /** BCP 47 locale tag. Governs grouping, symbol position and the compact suffix. */
  locale?: string;
  /** Single accent used for the curve, milestone nodes, the primary button and focus rings. */
  accent?: string;
  /** Skeleton state: dots stay unlit and breathe, accent and labels are suppressed. */
  loading?: boolean;
  /** First two render as avatars in the pill; the rest roll into a "+n" count. Empty shows the invite state. */
  participants?: SavingsChallengeParticipant[];
  totalLabel?: string;
  remainingLabel?: string;
  /** Shown in the pill when participants is empty. */
  emptyLabel?: string;
  /** Accessible label for the primary button. */
  depositLabel?: string;
  /** Fired by the primary button. The card renders no deposit UI of its own -- open your own sheet/modal here. */
  onDeposit?: () => void;
  /** Fired when the contributor drawer opens or closes. */
  onToggleRoster?: (open: boolean) => void;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const SHELL_CLASS =
  "relative isolate w-full max-w-sm overflow-hidden rounded-[var(--card-radius)] border border-black/50 bg-gradient-to-b from-[#202020] to-[#191919] p-[var(--card-inset)] shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_1px_#ffffff35_inset,0_10px_10px_-9px_#00000070,0_20px_20px_-14px_#00000060,0_0px_6px_0px_#00000060] [--card-inner-radius:calc(var(--card-radius)_-_var(--card-inset))] [--card-inset:1.25rem] [--card-radius:2rem] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:bg-[url('/textures/plastic-noise.svg')] before:bg-[length:180px_180px] before:bg-repeat before:opacity-20 before:mix-blend-overlay before:content-['']";

const CAVITY_CLASS =
  "relative isolate overflow-hidden rounded-[var(--card-inner-radius)] bg-[#111111] shadow-[0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset] after:pointer-events-none after:absolute after:inset-0 after:z-20 after:rounded-[inherit] after:shadow-[inset_0_0_24px_4px_#00000080] after:content-['']";

const WELL_CLASS = "rounded-full bg-[#0a0a0a] shadow-[0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset]";

function formatMoney(amount: number, currency: string, locale: string, compact?: boolean) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: compact ? 1 : 0,
      notation: compact ? "compact" : "standard",
    }).format(amount);
  } catch {
    return `$${Math.round(amount).toLocaleString("en-US")}`;
  }
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SavingsChallengeCard({
  className,
  title = "Bitcoin BTC",
  duration = "2 months challenge",
  amount = 55320,
  goal = 68120,
  progress,
  currency = "USD",
  locale = "en-US",
  accent = "#d8ec4a",
  loading = false,
  participants = [],
  totalLabel = "Total Amount",
  remainingLabel = "Left to reach the goal",
  emptyLabel = "No one yet",
  depositLabel = "Add to this challenge",
  onDeposit,
  onToggleRoster,
}: SavingsChallengeCardProps) {
  const gradientId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [shown, setShown] = useState(amount);
  const [rosterOpen, setRosterOpen] = useState(false);
  const previousAmount = useRef(amount);

  useEffect(() => {
    if (previousAmount.current === amount) return;
    previousAmount.current = amount;

    if (shouldReduceMotion) {
      setShown(amount);
      return;
    }

    const controls = animate(shown, amount, {
      duration: 0.85,
      ease: EASE_OUT,
      onUpdate: setShown,
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when amount changes
  }, [amount, shouldReduceMotion]);

  const safeGoal = Math.max(1, goal);
  const remaining = Math.max(0, safeGoal - amount);
  const ratio = progress ?? Math.min(1, amount / safeGoal);
  const clampedRatio = Math.min(1, Math.max(0, ratio));
  const visibleParticipants = participants.slice(0, 2);
  const extraCount = participants.length - visibleParticipants.length;

  const handleToggleRoster = () => {
    if (loading || participants.length === 0) return;
    const next = !rosterOpen;
    setRosterOpen(next);
    onToggleRoster?.(next);
  };

  return (
    <div
      aria-label={`${title} savings challenge, ${Math.round(clampedRatio * 100)} percent of goal`}
      className={cn("w-full max-w-sm text-[#c9c6bf]", className)}
      role="group"
      style={{ "--acc": accent } as CSSProperties}
    >
      <div className={SHELL_CLASS}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[12%] top-0 z-[1] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />

        <div className="relative z-10 flex min-h-11 items-center justify-center px-14">
          <span className={cn("absolute left-0 top-1/2 grid size-10 -translate-y-1/2 place-items-center", WELL_CLASS)}>
            <svg
              className="size-[66%]"
              fill="none"
              stroke={loading ? "#3a3a37" : "#e3a552"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.4}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9.1" />
              <path d="M10.1 7.1v9.8" />
              <path d="M11.9 5.9v1.2M13.9 5.9v1.2M11.9 16.9v1.2M13.9 16.9v1.2" />
              <path d="M10.1 7.3h4.1a2.1 2.1 0 0 1 0 4.2h-4.1" />
              <path d="M10.1 11.5h4.6a2.35 2.35 0 0 1 0 4.7h-4.6" />
            </svg>
          </span>
          <div className="min-w-0 text-center">
            <div className="text-2xl font-medium leading-tight tracking-[-0.025em] text-[#eeebe4] [text-shadow:0_1px_0_#00000080]">
              {loading ? "\u2014" : title}
            </div>
            <div className="mt-0.5 text-sm text-[#83817b]">{loading ? "" : duration}</div>
          </div>
        </div>

        <div className={cn(CAVITY_CLASS, "relative z-10 mt-6 px-5 py-5")}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[44%] rounded-[inherit] bg-gradient-to-b from-white/5 to-transparent"
          />
          <div className="relative z-[1]">
            <DotMatrix
              ariaLabel={loading ? "Loading" : undefined}
              center
              className={loading ? "animate-pulse" : undefined}
              gradientId={`${gradientId}-amount`}
              height="clamp(30px,14.4cqw,58px)"
              text={loading ? "$00,000" : formatMoney(shown, currency, locale).toUpperCase()}
            />
          </div>
        </div>
        <div className="relative z-10 mt-3 text-center text-base text-[#9d9b95]" style={{ visibility: loading ? "hidden" : "visible" }}>
          {totalLabel}
        </div>

        <div
          aria-label={`${Math.round(clampedRatio * 100)}% of ${formatMoney(safeGoal, currency, locale)} goal`}
          className="relative z-10 mt-8"
          role="progressbar"
          style={{ paddingBottom: "31.2%" }}
        >
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 340 106">
            <line stroke="#ffffff" strokeDasharray="0.1 7.4" strokeLinecap="round" strokeOpacity={0.16} strokeWidth={2.1} x1={1} x2={339} y1={90} y2={90} />
            <path d="M140 90 A30 30 0 0 1 200 90" fill="none" stroke="#ffffff" strokeLinecap="round" strokeOpacity={0.2} strokeWidth={2.1} />
            <path d="M200 90 A68 68 0 0 1 336 90" fill="none" stroke="#ffffff" strokeLinecap="round" strokeOpacity={0.09} strokeWidth={2.4} />
            <motion.path
              animate={{ pathLength: loading ? 0 : clampedRatio }}
              d="M200 90 A68 68 0 0 1 336 90"
              fill="none"
              initial={false}
              stroke={loading ? "transparent" : accent}
              strokeLinecap="round"
              strokeWidth={2.4}
              transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: EASE_OUT }}
            />
            <circle cx={140} cy={91.2} fill="#000000" opacity={0.55} r={4.4} />
            <circle cx={140} cy={90} fill="#2f2e2b" r={4.4} />
            <circle cx={140} cy={88.9} fill="#57565159" r={2.4} />
            <circle cx={200} cy={91.2} fill="#000000" opacity={0.6} r={5} />
            <circle cx={200} cy={90} fill={loading ? "#2f2e2b" : accent} r={5} />
            <circle cx={200} cy={88.6} fill="#ffffff" opacity={0.26} r={2.2} />
            <circle cx={336} cy={91.2} fill="#000000" opacity={0.6} r={5} />
            <circle cx={336} cy={90} fill={loading ? "#2f2e2b" : accent} r={5} />
            <circle cx={336} cy={88.6} fill="#ffffff" opacity={0.26} r={2.2} />
          </svg>
          <div className="absolute left-0 top-0 w-[56%]">
            <div className="text-sm text-[#9d9b95]" style={{ visibility: loading ? "hidden" : "visible" }}>
              {remainingLabel}
            </div>
            <div className="mt-2">
              <DotMatrix
                gradientId={`${gradientId}-remaining`}
                gradientStops={[
                  { offset: "0", color: "#f3f0e7" },
                  { offset: "0.5", color: "#d6d2c7" },
                  { offset: "1", color: "#8d8980" },
                ]}
                height="clamp(19px,6.2cqw,27px)"
                text={loading ? "0000" : formatMoney(remaining, currency, locale, true).toUpperCase()}
              />
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {rosterOpen && participants.length > 0 && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              className={cn(CAVITY_CLASS, "relative z-10 mt-5 overflow-hidden px-4 py-2.5")}
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: EASE_OUT }}
            >
              {participants.map((person) => (
                <div className="flex items-center justify-between gap-3.5 py-1" key={person.name}>
                  <span className="truncate text-sm text-[#aeaca6]">{person.name}</span>
                  <span className="shrink-0 font-mono text-xs text-[#7a7973]">
                    {formatMoney(person.amount ?? 0, currency, locale)}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 mt-6 flex items-center gap-3">
          <div className={cn(WELL_CLASS, "flex h-14 min-w-0 flex-1 items-center justify-between px-1.5")}>
            {participants.length > 0 ? (
              <div className="ml-2.5 flex min-w-0 items-center">
                {visibleParticipants.map((person) => (
                  <div
                    className="relative ml-[-9px] size-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-[#2e2e2c] to-[#202020] ring-[2.5px] ring-[#0e0e0e] [box-shadow:0_1px_0.5px_#ffffff2b_inset,0_3px_6px_-4px_#000000e0]"
                    key={person.name}
                    title={person.name}
                  >
                    {person.src ? (
                      <img alt={person.name} className="size-full object-cover [filter:saturate(0.82)_contrast(1.04)]" src={person.src} />
                    ) : (
                      <span className="grid size-full place-items-center font-mono text-xs" style={{ color: person.tint ?? "#b9b7b1" }}>
                        {person.initials ?? initialsFor(person.name)}
                      </span>
                    )}
                  </div>
                ))}
                {extraCount > 0 && <span className="ml-3 font-mono text-xs text-[#75746f]">{`+${extraCount}`}</span>}
              </div>
            ) : (
              <div className="ml-2.5 flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-white/15 text-[#6d6c67]">
                  <UserIcon size={16} weight="regular" />
                </span>
                <span className="truncate text-sm text-[#7d7c76]">{loading ? "" : emptyLabel}</span>
              </div>
            )}

            <button
              aria-expanded={rosterOpen}
              aria-label={rosterOpen ? "Hide contributors" : "Show contributors"}
              className="grid shrink-0 place-items-center rounded-full p-2.5 text-[#6d6c67] transition hover:bg-white/[0.06] hover:text-[#c2c0ba] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              disabled={loading || participants.length === 0}
              onClick={handleToggleRoster}
              style={{ outlineColor: accent }}
              type="button"
            >
              <CaretDoubleRightIcon className={cn("size-5 transition-transform", rosterOpen && "rotate-90")} weight="bold" />
            </button>
          </div>

          <div className={cn(WELL_CLASS, "shrink-0 p-1")} style={{ width: "clamp(50px,17.5cqw,66px)", height: "clamp(50px,17.5cqw,66px)" }}>
            <button
              aria-label={depositLabel}
              className="grid size-full place-items-center rounded-full text-[#181b09] transition [box-shadow:0_1px_0.5px_#ffffff8c_inset,0_-2px_3px_#00000038_inset,0_4px_9px_-5px_#000000d9] hover:brightness-105 active:translate-y-[1.5px] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px]"
              disabled={loading}
              onClick={onDeposit}
              style={{
                background: loading
                  ? "#1e1e1e"
                  : `linear-gradient(180deg, color-mix(in oklab, ${accent} 80%, #ffffff) 0%, ${accent} 52%, color-mix(in oklab, ${accent} 84%, #000000) 100%)`,
                outlineColor: accent,
              }}
              type="button"
            >
              <PlusIcon className="size-6" weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
