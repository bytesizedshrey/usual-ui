import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { CodeIcon } from "@phosphor-icons/react";
import { CodeBlock } from "@/components/ui/code-block";
import { Tabs } from "@/components/ui/tabs";
import SourceCodePopover from "@/components/SourceCodePopover";
import { cn } from "@/lib/utils";
import type { ComponentDoc } from "@/lib/component-docs";
import { ExpandableCode, PackageManagerTabs, PropRow } from "./doc-blocks";

export interface ComponentDocsPageProps {
  doc: ComponentDoc;
  /** Show the "← Back to showcase" navigation link. Defaults to true (standalone page use). */
  showBackLink?: boolean;
}

function ComponentDocsPage({ doc, showBackLink = true }: ComponentDocsPageProps) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const sourceAnchorRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-20">

      {/* 1. HEADER */}
      <section>
        {showBackLink ? (
          <Link
            className="text-sm text-white/50 transition-colors hover:text-white/80 inline-flex items-center gap-1.5"
            to="/"
          >
            ← Back to showcase
          </Link>
        ) : null}
        <h1 className="mt-8 text-3xl font-semibold tracking-tighter">
          {doc.name}
        </h1>
        <p className="mt-2 text-sm text-white/50 font-mono">
          {doc.filePath}
        </p>
        <p className="mt-6 text-white/70 leading-relaxed max-w-2xl">
          {doc.description}
        </p>
        {doc.secondaryNote ? (
          <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-2xl">
            {doc.secondaryNote}
          </p>
        ) : null}
      </section>

      {/* 2. INSTALLATION */}
      <section>
        <h2 className="text-xl font-medium tracking-tight mb-6 text-white">Installation</h2>
        <Tabs tabs={["CLI", "Manual"]}>
          <div className="pt-2">
            <p className="text-sm text-white/70 mb-4">{doc.install.cliIntro}</p>
            <PackageManagerTabs commands={doc.install.cliCommands} />
          </div>
          <div className="pt-2">
            <p className="text-sm text-white/70 mb-4">{doc.install.manualIntro}</p>
            <CodeBlock code={doc.install.manualText} language="text" />
          </div>
        </Tabs>
      </section>

      {/* 3. DEMO USAGE */}
      <section>
        <h2 className="text-xl font-medium tracking-tight mb-6 text-white">Demo Usage</h2>
        <p className="text-sm text-white/70 mb-4">
          {doc.demoUsage.description}
        </p>
        <CodeBlock code={doc.demoUsage.code} language={doc.demoUsage.language ?? "tsx"} showLineNumbers />
      </section>

      {/* 4. LIVE EXAMPLE / PREVIEW */}
      <section>
        <h2 className="text-xl font-medium tracking-tight mb-6 text-white">Example usage</h2>
        <div
          className={cn(
            "rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center p-12 mb-4 shadow-2xl relative",
            doc.exampleUsage.previewMinHeight,
          )}
        >
          <div className="w-full flex items-center justify-center">
            {doc.exampleUsage.preview}
          </div>
        </div>
        <ExpandableCode code={doc.exampleUsage.code} language="tsx" />
      </section>

      {/* 5. COMPONENT PROPS */}
      {doc.propGroups.length > 0 ? (
        <section>
          <h2 className="text-xl font-medium tracking-tight mb-6 text-white">Component props</h2>

          <div className="space-y-8">
            {doc.propGroups.map((group) => (
              <div key={group.heading}>
                <h3 className="text-lg font-medium text-white mb-4">{group.heading}</h3>
                <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]/50 px-6">
                  {group.rows.map((row) => (
                    <PropRow key={row.name} {...row} />
                  ))}
                </div>
              </div>
            ))}

            {doc.propsFootnote ? (
              <p className="text-sm text-white/50 mt-4 italic">
                {doc.propsFootnote}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 6. SOURCE CODE */}
      <section>
        <h2 className="text-xl font-medium tracking-tight mb-6 text-white">Source Code</h2>
        <p className="text-sm text-white/70 mb-4">
          {doc.source.intro}
        </p>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0a0a0a]/50 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          onClick={() => setSourceOpen((value) => !value)}
          ref={sourceAnchorRef}
          type="button"
        >
          <CodeIcon size={16} weight="bold" />
          View Source Code
        </button>
      </section>

      <SourceCodePopover
        anchorRef={sourceAnchorRef}
        doc={doc}
        onOpenChange={setSourceOpen}
        open={sourceOpen}
      />
    </div>
  );
}

export default ComponentDocsPage;
