"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckIcon, CopyIcon, XIcon } from "@phosphor-icons/react";
import {
  usePopover,
  type PopoverAlign,
  type PopoverSide,
} from "@/components/interior/popover";
import { CodeBlock } from "@/components/ui/code-block";
import { CodeHighlight } from "@/components/ui/code-highlight";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ComponentDoc } from "@/lib/component-docs";
import { ExpandableCode, PackageManagerTabs, PropRow } from "@/components/ComponentDocsPage/doc-blocks";

const MOBILE_QUERY = "(max-width: 639px)";

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

const EASE = [0.23, 1, 0.32, 1] as const;
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;

const ARROW_EDGE: Record<PopoverSide, string> = {
  bottom: "border-t border-l",
  top: "border-b border-r",
  right: "border-b border-l",
  left: "border-t border-r",
};

const FROM: Record<PopoverSide, { x?: number; y?: number }> = {
  top: { y: 6 },
  bottom: { y: -6 },
  left: { x: 6 },
  right: { x: -6 },
};

export interface SourceCodePopoverProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc: ComponentDoc;
  side?: PopoverSide;
  align?: PopoverAlign;
}

function SourceCodePopover({
  anchorRef,
  open,
  onOpenChange,
  doc,
  side = "bottom",
  align = "center",
}: SourceCodePopoverProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobileViewport();
  const sourceLanguage = doc.source.language ?? "tsx";

  const { floatingRef, panelRef, contentRef, arrowRef, side: at } = usePopover({
    open,
    side,
    align,
    offset: 10,
    padding: isMobile ? 12 : 24,
    anchorRef,
    maxContentHeightRatio: isMobile ? 0.82 : 0.78,
    maxContentHeightPx: isMobile ? 760 : 820,
  });

  const setOpen = useCallback(
    (next: boolean) => onOpenChange(next),
    [onOpenChange],
  );

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus({ preventScroll: true });
  }, [open, panelRef]);

  useEffect(() => {
    if (!open) return;
    const content = contentRef.current;
    if (!content) return;

    const onWheel = (event: WheelEvent) => {
      if (content.scrollHeight <= content.clientHeight) return;
      event.preventDefault();
      content.scrollTop += event.deltaY;
    };

    content.addEventListener("wheel", onWheel, { passive: false });
    return () => content.removeEventListener("wheel", onWheel);
  }, [open, contentRef]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, setOpen, anchorRef, panelRef]);

  const handleCopySource = () => {
    navigator.clipboard.writeText(doc.source.code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div key="source-code-popover" ref={floatingRef} className="fixed left-0 top-0 z-50">
          <motion.div
            ref={panelRef}
            id={id}
            role="dialog"
            aria-label={`${doc.name} documentation`}
            aria-modal="false"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, ...FROM[at] }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.1 } }
                : { opacity: 0, scale: 0.97, transition: { duration: 0.13, ease: EASE } }
            }
            transition={
              reduced ? { duration: 0 } : { ...CROSSFADE, opacity: { duration: 0.14, ease: EASE } }
            }
            className={cn(
              "relative flex flex-col overflow-hidden rounded-[14px] border border-white/[0.12] bg-[#0c0c0c] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] focus-visible:outline-none",
              isMobile
                ? "w-[calc(100vw-24px)]"
                : "w-[clamp(680px,64vw,1040px)] min-h-[420px]",
            )}
          >
            <span
              ref={arrowRef}
              aria-hidden
              style={{ width: 9, height: 9, transform: "rotate(45deg)" }}
              className={`absolute block bg-[#0c0c0c] border-white/[0.12] ${ARROW_EDGE[at]}`}
            />

            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-3.5 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[13px] font-medium text-white">{doc.name}</span>
                <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white/50">
                  {doc.filePath}
                </span>
              </div>
              <button
                aria-label="Close"
                className="flex shrink-0 items-center justify-center rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
                type="button"
              >
                <XIcon size={14} weight="bold" />
              </button>
            </div>

            <div
              ref={contentRef}
              className="relative overflow-auto overscroll-contain p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] text-[13px] leading-[1.65]"
            >
              <div className="space-y-10">
                <section>
                  <h3 className="text-sm font-semibold text-white mb-4">Install</h3>
                  <div className="space-y-3">
                    {doc.install.cliCommands ? (
                      <>
                        <p className="text-sm text-white/70">{doc.install.cliIntro}</p>
                        <Tabs tabs={["CLI", "Manual"]}>
                          <div className="pt-1">
                            <PackageManagerTabs commands={doc.install.cliCommands} />
                          </div>
                          <div className="pt-1 space-y-3">
                            <p className="text-sm text-white/70">{doc.install.manualIntro}</p>
                            <CodeBlock code={doc.install.manualText} language="text" />
                          </div>
                        </Tabs>
                      </>
                    ) : (
                      <div className="pt-1 space-y-3">
                        <p className="text-sm text-white/70">{doc.install.manualIntro}</p>
                        <CodeBlock code={doc.install.manualText} language="text" />
                      </div>
                    )}
                  </div>
                </section>

                <section className="border-t border-white/10 pt-8">
                  <h3 className="text-sm font-semibold text-white mb-4">Usage</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-white/70">{doc.demoUsage.description}</p>
                    <CodeBlock
                      code={doc.demoUsage.code}
                      language={doc.demoUsage.language ?? "tsx"}
                      showLineNumbers
                    />
                  </div>
                </section>

                <section className="border-t border-white/10 pt-8">
                  <h3 className="text-sm font-semibold text-white mb-4">Example Usage</h3>
                  <div
                    className={cn(
                      "rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center p-8 shadow-2xl relative",
                      doc.exampleUsage.previewMinHeight,
                    )}
                  >
                    <div className="w-full flex items-center justify-center">
                      {doc.exampleUsage.preview}
                    </div>
                  </div>
                  <ExpandableCode code={doc.exampleUsage.code} language="tsx" />
                </section>

                <section className="border-t border-white/10 pt-8">
                  <h3 className="text-sm font-semibold text-white mb-4">Component Props</h3>
                  {doc.propGroups.length > 0 ? (
                    <div className="space-y-6">
                      {doc.propGroups.map((group) => (
                        <div key={group.heading}>
                          <h4 className="text-sm font-medium text-white mb-3">{group.heading}</h4>
                          <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] px-5">
                            {group.rows.map((row) => (
                              <PropRow key={row.name} {...row} />
                            ))}
                          </div>
                        </div>
                      ))}
                      {doc.propsFootnote ? (
                        <p className="text-sm text-white/50 italic">{doc.propsFootnote}</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50 italic">
                      This component has no public props to document.
                    </p>
                  )}
                </section>

                <section className="border-t border-white/10 pt-8">
                  <h3 className="text-sm font-semibold text-white mb-4">Source</h3>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-white">{doc.source.title}</span>
                      <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white/50">
                        {sourceLanguage}
                      </span>
                    </div>
                    <button
                      className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                      onClick={handleCopySource}
                      type="button"
                    >
                      {copied ? (
                        <>
                          <CheckIcon size={13} />
                          Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon size={13} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <CodeHighlight code={doc.source.code} language={sourceLanguage} showLineNumbers />
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export default SourceCodePopover;
