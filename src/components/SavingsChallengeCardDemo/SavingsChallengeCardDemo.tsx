import { useState } from "react";
import { SavingsChallengeCard } from "../SavingsChallengeCard";

// The card fires onDeposit and owns no deposit UI itself -- this sheet is
// entirely host-side, matching how usual-ui expects consumers to wire it up.
const STEPS = [50, 100, 250, 500, 1000, 2500];

function SavingsChallengeCardDemo() {
  const [amount, setAmount] = useState(55320);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(2);
  const step = STEPS[stepIndex];

  const handleConfirm = () => {
    setAmount((current) => Math.min(68120, current + step));
    setSheetOpen(false);
  };

  return (
    <div className="relative mx-auto max-w-sm [zoom:0.9]">
      <SavingsChallengeCard
        amount={amount}
        goal={68120}
        onDeposit={() => setSheetOpen(true)}
        participants={[
          { name: "Mara Vos", amount: 21400, tint: "#d8ec4a" },
          { name: "Idris Kane", amount: 18960, tint: "#8fb8e8" },
          { name: "Lena Ohm", amount: 14960, tint: "#e0a96d" },
        ]}
      />

      {sheetOpen && (
        <div aria-label="Add to challenge" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center p-4" role="dialog">
          <button aria-label="Close" className="absolute inset-0 bg-[#030304]/70 backdrop-blur-sm" onClick={() => setSheetOpen(false)} type="button" />
          <div className="relative w-full max-w-sm rounded-[2rem] border border-black/50 bg-gradient-to-b from-[#202020] to-[#191919] p-5 [box-shadow:0_1px_0.5px_#ffffff1a_inset,0_1px_1px_#ffffff35_inset,0_22px_40px_-18px_#000000e0]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-medium text-[#eeebe4]">Add to Bitcoin BTC</div>
                <div className="mt-0.5 text-xs text-[#83817b]">Host-owned sheet, not part of the card</div>
              </div>
              <button
                aria-label="Close"
                className="grid size-8 place-items-center rounded-full bg-[#0e0e0e] text-[#8b8a84] [box-shadow:0_0.5px_0_#ffffff40,0_2px_6px_#00000090_inset]"
                onClick={() => setSheetOpen(false)}
                type="button"
              >
                x
              </button>
            </div>

            <div className="mt-5 flex h-16 items-center gap-2.5 rounded-full bg-[#111111] px-2 [box-shadow:0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset]">
              <button
                aria-label="Decrease"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#2b2b2b] to-[#1f1f1f] text-[#bab8b2]"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                type="button"
              >
                -
              </button>
              <div className="flex-1 text-center font-mono text-lg text-[#eae8e2]">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(step)}
              </div>
              <button
                aria-label="Increase"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#2b2b2b] to-[#1f1f1f] text-[#bab8b2]"
                onClick={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}
                type="button"
              >
                +
              </button>
            </div>

            <button className="mt-3 h-14 w-full rounded-full bg-[#d8ec4a] text-sm font-medium text-[#181b09]" onClick={handleConfirm} type="button">
              Deposit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavingsChallengeCardDemo;
