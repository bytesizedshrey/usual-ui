import { useState } from "react";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { CodeBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";
import { PACKAGE_MANAGERS, type PackageManager } from "@/lib/component-docs";

export function ExpandableCode({
  code,
  language = "tsx",
  maxHeight = "max-h-[400px]",
}: {
  code: string;
  language?: string;
  maxHeight?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative mt-4">
      <div
        className={cn(
          "overflow-hidden transition-all relative rounded-xl border border-white/10",
          expanded ? "" : maxHeight,
        )}
      >
        <CodeBlock code={code} language={language} className="border-none rounded-none" />
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
        )}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors border border-white/10 rounded-lg hover:bg-white/5"
      >
        {expanded ? (
          <>Collapse code <CaretUpIcon weight="bold" /></>
        ) : (
          <>Expand code <CaretDownIcon weight="bold" /></>
        )}
      </button>
    </div>
  );
}

export function PropRow({
  name,
  type,
  defaultVal,
  description,
}: {
  name: string;
  type: string;
  defaultVal?: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/10 py-4 last:border-0 flex flex-col sm:flex-row gap-4 sm:gap-6">
      <div className="flex-shrink-0 w-full sm:w-48">
        <div className="font-mono text-sm text-emerald-400">{name}</div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="font-mono text-xs text-white/60">
          <span className="text-white/40">type: </span>{type}
          {defaultVal && (
            <>
              <span className="text-white/40 ml-4">default: </span>{defaultVal}
            </>
          )}
        </div>
        <div className="text-sm text-white/70 leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
}

export function PackageManagerTabs({
  commands,
}: {
  commands: Record<PackageManager, string>;
}) {
  const [active, setActive] = useState<PackageManager>("npm");

  return (
    <div className="space-y-3">
      <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        {PACKAGE_MANAGERS.map((pm) => (
          <button
            key={pm}
            onClick={() => setActive(pm)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              active === pm
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/80",
            )}
            type="button"
          >
            {pm}
          </button>
        ))}
      </div>
      <CodeBlock code={commands[active]} language="bash" />
    </div>
  );
}
