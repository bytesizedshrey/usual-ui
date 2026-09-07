import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  ReceiptPrinter,
  type ReceiptPrinterStage,
} from "../ReceiptPrinter";

const stageDurations: Record<ReceiptPrinterStage, number> = {
  processing: 1800,
  printing: 2200,
  complete: 2800,
};

const nextStage: Record<ReceiptPrinterStage, ReceiptPrinterStage> = {
  processing: "printing",
  printing: "complete",
  complete: "processing",
};

function ReceiptPrinterDemo() {
  const [stage, setStage] = useState<ReceiptPrinterStage>("processing");

  useEffect(() => {
    if (stage === "complete") return;

    const timeout = setTimeout(() => {
      setStage((current) => nextStage[current]);
    }, stageDurations[stage]);

    return () => clearTimeout(timeout);
  }, [stage]);

  const handleReprint = () => {
    setStage("processing");
  };

  return (
    <ReceiptPrinter.Root className="[zoom:0.55]" stage={stage}>
      <ReceiptPrinter.Machine>
        <ReceiptPrinter.Header>
          <img
            alt=""
            className="size-6"
            src="/images/receipt-printer-logo.png"
          />
          <button
            aria-label="Reprint receipt"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#202020] to-[#191919] px-3 py-1.5 text-xs font-medium text-[#8f8b82] shadow-[0_0.5px_0.5px_#ffffff1a_inset,0_1px_1px_#ffffff30_inset,0_2px_4px_-1px_#00000070,0_4px_8px_-2px_#00000060] transition hover:text-[#e7e4dc] hover:brightness-110 active:scale-[0.97] active:shadow-[0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
            disabled={stage !== "complete"}
            onClick={handleReprint}
            type="button"
          >
            <ArrowClockwiseIcon size={12} weight="bold" />
            Reprint
          </button>
        </ReceiptPrinter.Header>

        <ReceiptPrinter.Screen>
          {/* Any React DOM can go on the screen. */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-tight text-[#e7e4dc]">
                  Pro plan
                </p>
                <p className="text-sm leading-tight text-[#8f8b82]">
                  Annual subscription
                </p>
              </div>
              <strong className="text-2xl font-semibold leading-tight text-[#e7e4dc]">
                £230.40
              </strong>
            </div>
            <ReceiptPrinter.Status />
          </div>
        </ReceiptPrinter.Screen>
      </ReceiptPrinter.Machine>

      <ReceiptPrinter.Output>
        <ReceiptPrinter.Paper>
          {/* Any React DOM can be printed. */}
          <h2 className="text-xl font-semibold tracking-tight text-[#211c18]">
            Receipt
          </h2>
          <hr className="my-3 border-t border-dashed border-[#00000024]" />
          <dl className="space-y-1">
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-[#5a5148]">Total paid</dt>
              <dd className="text-2xl font-semibold text-[#211c18]">
                £230.40
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-[#5a5148]">Thanks for your order.</p>
        </ReceiptPrinter.Paper>
      </ReceiptPrinter.Output>
    </ReceiptPrinter.Root>
  );
}

export default ReceiptPrinterDemo;
