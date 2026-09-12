"use client";

import React from "react";
import { type ComponentPropsWithoutRef } from "react";
import "./styles.css";

export type VintageKeyboardTheme = "graphite" | "ivory" | "olive";
export type VintageKeyboardLayout = "full" | "compact" | "numpad" | "iso";
export type VintageKeyboardSize = "default" | "compact";

export interface VintageKeyboardProps extends Omit<ComponentPropsWithoutRef<"div">, "onKeyPress"> {
  theme?: VintageKeyboardTheme;
  layout?: VintageKeyboardLayout;
  size?: VintageKeyboardSize;
  soundEnabled?: boolean;
  haptics?: boolean;
  activeKeys?: string[];
  disabledKeys?: string[];
  onKeyPress?: (e: { code: string; char: string | null; shift: boolean; caps: boolean }) => void;
  accentKeys?: string[];
}

export default function VintageKeyboard({
  theme = "ivory",
  layout = "full",
  size = "default",
  soundEnabled = true,
  haptics = true,
  activeKeys = [],
  disabledKeys = [],
  accentKeys,
  onKeyPress,
  ...props
}: VintageKeyboardProps) {
  const [scale, setScale] = React.useState(1);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const boardRef = React.useRef<HTMLDivElement>(null);
  const uiRef = React.useRef({ down: {} as Record<string, number>, caps: false, shift: false, latch: false });
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const noiseBufferRef = React.useRef<AudioBuffer | null>(null);

  const layoutRows = React.useMemo(() => {
    const L = (c: string, m: string, s?: string, u?: number, kind?: string) => ({
      code: c, main: m, sub: s || "", u: u || 1, kind: kind || "key",
    });
    let sp = 0;
    const S = (u: number) => ({ code: 'spacer' + (++sp), main: "", sub: "", u, kind: "spacer" });
    const F = (i: number) => L('F' + i, 'F' + i, "", 1, "mod");

    const a1 = [L("Backquote", "`", "~"), L("Digit1", "1", "!"), L("Digit2", "2", "@"), L("Digit3", "3", "#"), L("Digit4", "4", "$"), L("Digit5", "5", "%"), L("Digit6", "6", "^"), L("Digit7", "7", "&"), L("Digit8", "8", "*"), L("Digit9", "9", "("), L("Digit0", "0", ")"), L("Minus", "-", "_"), L("Equal", "=", "+"), L("Backspace", "BACKSPACE", "", 2, "mod")];
    const a2 = [L("Tab", "TAB", "", 1.5, "mod"), ..."QWERTYUIOP".split("").map((ch) => L('Key' + ch, ch)), L("BracketLeft", "[", "{"), L("BracketRight", "]", "}"), L("Backslash", "\\", "|", 1.5)];
    const a3 = [L("CapsLock", "CAPS", "", 1.75, "mod"), ..."ASDFGHJKL".split("").map((ch) => L('Key' + ch, ch)), L("Semicolon", ";", ":"), L("Quote", "'", '"'), L("Enter", "ENTER", "", 2.25, "mod")];
    const a4 = [L("ShiftLeft", "SHIFT", "", 2.25, "mod"), ..."ZXCVBNM".split("").map((ch) => L('Key' + ch, ch)), L("Comma", ",", "<"), L("Period", ".", ">"), L("Slash", "/", "?"), L("ShiftRight", "SHIFT", "", 1.75, "mod")];
    const i3 = [L("CapsLock", "CAPS", "", 1.75, "mod"), ..."ASDFGHJKL".split("").map((ch) => L('Key' + ch, ch)), L("Semicolon", ";", ":"), L("Quote", "'", "@"), L("Backslash", "#", "~"), L("Enter", "ENTER", "", 1.25, "mod")];
    const i4 = [L("ShiftLeft", "SHIFT", "", 1.25, "mod"), L("IntlBackslash", "\\", "|"), ..."ZXCVBNM".split("").map((ch) => L('Key' + ch, ch)), L("Comma", ",", "<"), L("Period", ".", ">"), L("Slash", "/", "?"), L("ShiftRight", "SHIFT", "", 1.75, "mod")];

    if (layout === "compact") {
      return [a1, a2, a3, [...a4, L("ArrowUp", "↑", "", 1, "mod")], [L("ControlLeft", "CTRL", "", 1.25, "mod"), L("AltLeft", "OPTION", "", 1.25, "mod"), L("MetaLeft", "CMD", "", 1.5, "mod"), L("Space", "", "", 6.75, "space"), L("MetaRight", "CMD", "", 1.25, "mod"), L("ArrowLeft", "←", "", 1, "mod"), L("ArrowDown", "↓", "", 1, "mod"), L("ArrowRight", "→", "", 1, "mod")]];
    }

    const fn = [L("Escape", "ESC", "", 1, "mod"), S(0.5), F(1), F(2), F(3), F(4), S(0.5), F(5), F(6), F(7), F(8), S(0.5), F(9), F(10), F(11), F(12), S(0.5), L("Delete", "DEL", "", 1, "mod")];
    const r1 = [...a1, L("Home", "HOME", "", 1, "mod")];
    const r2 = [...a2, L("PageUp", "PGUP", "", 1, "mod")];
    const r3 = [...(layout === "iso" ? i3 : a3), L("PageDown", "PGDN", "", 1, "mod")];
    const r4 = [...(layout === "iso" ? i4 : a4), L("ArrowUp", "↑", "", 1, "mod"), L("End", "END", "", 1, "mod")];
    const r5 = [L("ControlLeft", "CTRL", "", 1.25, "mod"), L("AltLeft", "OPTION", "", 1.25, "mod"), L("MetaLeft", "CMD", "", 1.5, "mod"), L("Space", "", "", 6.5, "space"), L("MetaRight", "CMD", "", 1.25, "mod"), L("AltRight", "OPTION", "", 1.25, "mod"), L("ArrowLeft", "←", "", 1, "mod"), L("ArrowDown", "↓", "", 1, "mod"), L("ArrowRight", "→", "", 1, "mod")];

    if (layout === "numpad") {
      const N = (c: string, m: string, u?: number) => L(c, m, "", u || 1, m.length > 1 ? "mod" : "key");
      return [
        [...fn, S(4.5)],
        [...r1, S(0.5), N("NumLock", "NUM"), N("NumpadDivide", "/"), N("NumpadMultiply", "*"), N("NumpadSubtract", "-")],
        [...r2, S(0.5), N("Numpad7", "7"), N("Numpad8", "8"), N("Numpad9", "9"), N("NumpadAdd", "+")],
        [...r3, S(0.5), N("Numpad4", "4"), N("Numpad5", "5"), N("Numpad6", "6"), S(1)],
        [...r4, S(0.5), N("Numpad1", "1"), N("Numpad2", "2"), N("Numpad3", "3"), N("NumpadEnter", "ENT")],
        [...r5, S(0.5), N("Numpad0", "0", 2), N("NumpadDecimal", "."), S(1)],
      ];
    }
    return [fn, r1, r2, r3, r4, r5];
  }, [layout]);

  const palette = React.useMemo(() => {
    if (theme === "ivory") return { shellA: "#2a2724", shellB: "#211f1c", deck: "#151311", well: "#100f0d", capTop: "#d6cfbe", capMid: "#cac2af", capBot: "#b8af9a", edge: "#5f584a", legend: "#26231e", modTop: "#b8b0a0", modMid: "#aca492", modBot: "#9a9280", modEdge: "#4e483d", modLegend: "#231f1a" };
    if (theme === "olive") return { shellA: "#2b2d26", shellB: "#22241e", deck: "#141610", well: "#0f110c", capTop: "#3c4034", capMid: "#33372c", capBot: "#2a2e24", edge: "#141710", legend: "#e2decd", modTop: "#33372c", modMid: "#2c3026", modBot: "#24281e", modEdge: "#11140e", modLegend: "#cdc9b8" };
    return { shellA: "#292929", shellB: "#202020", deck: "#101010", well: "#0c0c0c", capTop: "#1e1e1e", capMid: "#171717", capBot: "#101010", edge: "#050505", legend: "#ededed", modTop: "#1b1b1b", modMid: "#151515", modBot: "#0e0e0e", modEdge: "#040404", modLegend: "#dcdcdc" };
  }, [theme]);

  const accentMat = { top: "#9e2b25", mid: "#84201b", bot: "#671612", edge: "#2b0705", legend: "#fbeceb" };
  const accentSet = accentKeys || ["Escape", "Enter", "NumpadEnter", "Backspace", "Delete", "Space"];

  const getAudioContext = () => {
    if (audioContextRef.current) return audioContextRef.current;
    try {
      const C = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!C) return null;
      const ac = new C();
      const len = Math.floor(ac.sampleRate * 0.12);
      const noise = ac.createBuffer(1, len, ac.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
      noiseBufferRef.current = noise;
      audioContextRef.current = ac;
      return ac;
    } catch (e) { return null; }
  };

  const playSound = (kind: string, up: boolean = false) => {
    if (!soundEnabled) return;
    const ac = getAudioContext();
    if (!ac || !noiseBufferRef.current) return;
    try {
      if (ac.state === "suspended") ac.resume();
      const now = ac.currentTime;
      const t = up ? 0.5 : 1;
      const cfg = kind === "space" ? { f: 118, bp: 1500, g: 0.28 } : kind === "mod" ? { f: 168, bp: 2100, g: 0.2 } : { f: 205, bp: 2700, g: 0.17 };
      const v = 0.92 + Math.random() * 0.16;
      const src = ac.createBufferSource();
      src.buffer = noiseBufferRef.current;
      const bp = ac.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = cfg.bp * v;
      bp.Q.value = 1.1;
      const ng = ac.createGain();
      ng.gain.setValueAtTime(cfg.g * t * v, now);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + (up ? 0.03 : 0.05));
      src.connect(bp);
      bp.connect(ng);
      ng.connect(ac.destination);
      src.start(now);
      src.stop(now + 0.12);
      const osc = ac.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(cfg.f * v, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.f * 0.62, now + 0.05);
      const og = ac.createGain();
      og.gain.setValueAtTime(0.18 * t * v, now);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(og);
      og.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) { }
  };

  const pressKey = (code: string, ev?: KeyboardEvent | React.PointerEvent) => {
    const u = uiRef.current;
    if (disabledKeys.includes(code) || u.down[code]) return;
    const keyDef = layoutRows.flat().find((k) => k.code === code);
    if (!keyDef || keyDef.kind === "spacer") return;
    const isKey = ev instanceof KeyboardEvent;
    playSound(keyDef.kind);
    if (navigator.vibrate && haptics) { try { navigator.vibrate(8); } catch (e) { } }
    u.down[code] = 1;
    if (code === "CapsLock") u.caps = isKey ? (ev as KeyboardEvent).getModifierState?.("CapsLock") ?? !u.caps : !u.caps;
    if (code === "ShiftLeft" || code === "ShiftRight") { if (isKey) u.shift = true; else u.latch = !u.latch; }
    const sh = u.shift || u.latch || (isKey ? (ev as KeyboardEvent).shiftKey : false);
    if (keyDef.kind === "key" || code === "Space") u.latch = false;
    syncCaps();
    if (onKeyPress) {
      let ch: string | null = null;
      if (code === "Space") ch = " ";
      else if (/^Key/.test(code)) ch = u.caps !== !!sh ? keyDef.main : keyDef.main.toLowerCase();
      else if (keyDef.kind === "key") ch = sh && keyDef.sub ? keyDef.sub : keyDef.main;
      onKeyPress({ code, char: ch, shift: !!sh, caps: u.caps });
    }
  };

  const releaseKey = (code: string, fromKey: boolean = false) => {
    const u = uiRef.current;
    if (!u.down[code]) return;
    const keyDef = layoutRows.flat().find((k) => k.code === code);
    if (keyDef) playSound(keyDef.kind, true);
    delete u.down[code];
    if (fromKey && (code === "ShiftLeft" || code === "ShiftRight")) u.shift = false;
    syncCaps();
  };

  const syncCaps = () => {
    if (!boardRef.current) return;
    const nodes = boardRef.current.querySelectorAll("[data-vk-cap]");
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i] as HTMLElement;
      const code = el.getAttribute("data-code");
      if (!code) continue;
      const latched = (code === "CapsLock" && uiRef.current.caps) || ((code === "ShiftLeft" || code === "ShiftRight") && uiRef.current.latch);
      const on = !disabledKeys.includes(code) && (!!uiRef.current.down[code] || activeKeys.includes(code) || latched);
      if (on) el.setAttribute("data-pressed", "1");
      else el.removeAttribute("data-pressed");
    }
  };

  React.useEffect(() => {
    const fit = () => {
      if (!wrapRef.current || !boardRef.current) return;
      const s = Math.min(1, wrapRef.current.clientWidth / (boardRef.current.offsetWidth || 1));
      if (Math.abs(s - scale) > 0.002) setScale(s);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(wrapRef.current!);
    fit();
    setTimeout(fit, 400);
    return () => ro.disconnect();
  }, [scale]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (!e.code || e.repeat) return; pressKey(e.code, e); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code) releaseKey(e.code, true); };
    const handleBlur = () => { uiRef.current.down = {}; uiRef.current.shift = false; syncCaps(); };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [layout, disabledKeys, onKeyPress]);

  React.useEffect(() => { return () => { audioContextRef.current?.close?.(); }; }, []);

  const unit = size === "compact" ? 26 : 34;
  const gap = size === "compact" ? 3 : 4;
  const depth = size === "compact" ? 2 : 2.5;
  const bezel = size === "compact" ? 12 : 16;
  const radius = size === "compact" ? 4 : 5;
  const units = Math.max(...layoutRows.map((r) => r.reduce((a, k) => a + k.u, 0)));
  const cols = Math.max(...layoutRows.map((r) => r.length));
  const boardW = Math.round(units * unit + (cols - 1) * gap + bezel * 2 + 12);
  const jit = (id: string) => {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 1000) / 1000;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 20px", background: "transparent", boxSizing: "border-box" }} {...props}>
      <div ref={wrapRef} style={{ width: "100%", maxWidth: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ transformOrigin: "center", transform: 'scale(' + scale + ')', width: boardW }}>
          <div ref={boardRef} style={{ position: "relative", width: boardW, boxSizing: "border-box", padding: bezel, borderRadius: "11px", background: 'linear-gradient(180deg, ' + palette.shellA + ' 0%, ' + palette.shellB + ' 100%)', boxShadow: "0 0.5px 0 #ffffff26 inset,0 1px 1px #ffffff20 inset,0 -1px 1px #00000060 inset,0 8px 10px -8px #00000080,0 16px 20px -14px #00000070,0 0 5px 0 #00000050" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "11px", pointerEvents: "none", background: "linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,0) 34%)" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "11px", pointerEvents: "none", opacity: 0.16, mixBlendMode: "overlay", backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22 viewBox=%220 0 180 180%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.92%22 numOctaves=%223%22 stitchTiles=%22stitch%22></feTurbulence><feColorMatrix type=%22saturate%22 values=%220%22></feColorMatrix></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22></rect></svg>')", backgroundSize: "180px 180px" }} />
            <div style={{ position: "relative", padding: Math.round(gap * 1.2), borderRadius: "7px", background: palette.deck, boxShadow: "0 0.5px 0 #ffffff22,0 2px 6px #00000090 inset", display: "flex", flexDirection: "column", gap }}>
              {layoutRows.map((keys, ri) => {
                const isFn = ri === 0 && (layout === "full" || layout === "iso" || layout === "numpad");
                const h = isFn ? Math.round(unit * 0.68) : unit;
                return (
                  <div key={ri} style={{ display: "flex", gap, height: h, marginBottom: ri === layoutRows.length - 1 ? 0 : gap }}>
                    {keys.map((k) => {
                      const w = k.u * unit + (k.u - 1) * gap;
                      const j = jit(k.code);
                      const dis = disabledKeys.includes(k.code);
                      const spacer = k.kind === "spacer";
                      const isMod = k.kind === "mod";
                      const wide = k.u >= 1.5;
                      const rightAl = ["Backspace", "Enter", "ShiftRight", "Delete"].includes(k.code);
                      const acc = !spacer && accentSet.includes(k.code) ? accentMat : null;
                      const top = acc ? acc.top : isMod ? palette.modTop : palette.capTop;
                      const mid = acc ? acc.mid : isMod ? palette.modMid : palette.capMid;
                      const bot = acc ? acc.bot : isMod ? palette.modBot : palette.capBot;
                      const edge = acc ? acc.edge : isMod ? palette.modEdge : palette.edge;
                      const ink = acc ? acc.legend : isMod ? palette.modLegend : palette.legend;
                      return (
                        <div key={k.code} style={spacer ? { flex: '0 0 ' + w + 'px', width: w, height: "100%", pointerEvents: "none" } : { position: "relative", flex: '0 0 ' + w + 'px', width: w, height: "100%", borderRadius: radius + 1, background: palette.well, boxShadow: "0 0.5px 0 #ffffff14,0 1px 3px #00000080 inset", cursor: dis ? "default" : "pointer", touchAction: "none" }} onPointerDown={(e) => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { } pressKey(k.code, e); }} onPointerUp={() => releaseKey(k.code)} onPointerLeave={() => releaseKey(k.code)} onPointerCancel={() => releaseKey(k.code)}>
                          {!spacer && (
                            <div data-vk-cap data-code={k.code} style={{ position: "absolute", top: 1, left: 1, right: 1, bottom: 1, borderRadius: radius, background: 'linear-gradient(180deg,' + top + ' 0%,' + mid + ' 60%,' + bot + ' 100%)', boxShadow: '0 0.5px 0.5px #ffffff0f inset,0 1px 2px #00000070 inset,0 0.5px 0 ' + edge + ',0 ' + depth + 'px 0 ' + edge + ',0 ' + (depth + 1.5) + 'px 4px -2px #000000b0', transform: "translateY(0px)", transition: "transform 62ms cubic-bezier(.2,.72,.3,1),box-shadow 62ms linear", filter: dis ? "brightness(.7)" : 'brightness(' + (0.985 + j * 0.035) + ')', display: "flex", flexDirection: "column", alignItems: k.sub ? "flex-start" : wide && isMod ? rightAl ? "flex-end" : "flex-start" : "center", justifyContent: k.sub ? "center" : wide && isMod ? "flex-end" : "center", gap: Math.round(unit * 0.06), padding: wide && isMod && !k.sub ? Math.round(unit * 0.14) + 'px ' + Math.round(unit * 0.2) + 'px' : Math.round(unit * 0.12), boxSizing: "border-box", overflow: "hidden", opacity: dis ? 0.5 : 1 }}>
                              {k.sub && <span style={{ display: "block", font: '500 ' + Math.round(unit * 0.29) + 'px/1 "Geist",ui-sans-serif,sans-serif', color: ink, opacity: 0.94 - j * 0.05 }}>{k.sub}</span>}
                              {k.kind !== "space" && !spacer && <span style={{ display: "block", font: '500 ' + Math.round(unit * (isMod ? (k.main.length > 3 ? 0.21 : 0.25) : 0.31)) + 'px/1 "Geist",ui-sans-serif,sans-serif', letterSpacing: isMod && k.main.length > 1 ? ".04em" : "0", color: ink, opacity: (k.sub ? 0.94 : 1) - j * 0.05 }}>{k.main}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
