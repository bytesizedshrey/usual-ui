import { Highlight, themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";

export interface CodeHighlightProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

/**
 * Just the syntax-highlighted <pre> block (prism-react-renderer), with no
 * header/copy chrome of its own. Shared by `CodeBlock` (which adds its own
 * header) and `SourceCodeModal` (which uses a single unified top bar).
 */
export function CodeHighlight({
  code,
  language = "tsx",
  showLineNumbers = false,
  className,
}: CodeHighlightProps) {
  return (
    <Highlight theme={themes.vsDark} code={code.trim()} language={language}>
      {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cn(highlightClassName, "font-mono m-0", className)}
          style={{ ...style, backgroundColor: "transparent" }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="table-row">
              {showLineNumbers && (
                <span className="table-cell text-right pr-4 text-white/30 select-none">
                  {i + 1}
                </span>
              )}
              <span className="table-cell">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
