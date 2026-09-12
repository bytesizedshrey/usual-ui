"use client";

import { useRef, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { PreviewStage } from "@/components/ui/preview-stage";
import { SavingsChallengeCard } from "@/components/SavingsChallengeCard";
import SourceCodePopover from "@/components/SourceCodePopover";
import { savingsChallengeCardDoc } from "@/lib/component-docs";

export default function SavingsChallengeCardCardDemo() {
  const [sourceOpen, setSourceOpen] = useState(false);
  const sourceAnchorRef = useRef<HTMLSpanElement>(null);

  return (
    <CardContainer className="inter-var" containerClassName="py-0" maxTilt={6}>
      <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full min-w-0 sm:w-96 h-auto rounded-xl p-4 border  ">
        <CardItem
          translateZ="50"
          className="text-base font-bold text-neutral-600 dark:text-white"
        >
          Savings Challenge Card
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="mt-1 max-w-xs text-xs text-neutral-500 dark:text-neutral-300"
        >
          A group savings goal with a recessed dot-matrix readout, milestone progress curve, and contributor roster.
        </CardItem>
        <CardItem
          translateZ="100"
          className="mt-3 flex w-full items-center justify-center"
        >
          <PreviewStage>
            <SavingsChallengeCard
              participants={[
                { name: "Mara Vos", amount: 21400, tint: "#d8ec4a" },
                { name: "Idris Kane", amount: 18960, tint: "#8fb8e8" },
              ]}
            />
          </PreviewStage>
        </CardItem>
        <div className="mt-4 flex w-full items-center justify-center">
          <span
            ref={sourceAnchorRef}
            className="inline-block"
            onClick={() => setSourceOpen((value) => !value)}
          >
            <CardItem
              as="button"
              className="group inline-flex h-auto items-center gap-1.5 rounded-full border border-white/[0.16] bg-[#1D1D1A] px-3 py-1.5 text-xs font-medium text-stone-200 transition-colors hover:border-white/30"
              translateZ={20}
              type="button"
            >
              <span className="inline-block transition-transform duration-150 group-hover:scale-[1.06] group-active:scale-[0.94]">
                Source Code
              </span>
            </CardItem>
          </span>
        </div>
      </CardBody>

      <SourceCodePopover
        anchorRef={sourceAnchorRef}
        doc={savingsChallengeCardDoc}
        onOpenChange={setSourceOpen}
        open={sourceOpen}
      />
    </CardContainer>
  );
}
