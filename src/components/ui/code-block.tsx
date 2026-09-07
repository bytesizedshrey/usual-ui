import { useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { CodeHighlight } from "@/components/ui/code-highlight";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = "tsx",
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-xl bg-[#0a0a0a] border border-white/10 overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="text-xs text-white/50 font-mono">{language}</div>
        <button
          onClick={onCopy}
          className="text-white/50 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
        >
          {copied ? (
            <>
              <CheckIcon size={14} />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon size={14} />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm">
        <CodeHighlight code={code} language={language} showLineNumbers={showLineNumbers} />
      </div>
    </div>
  );
}
