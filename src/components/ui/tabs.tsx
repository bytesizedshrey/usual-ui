import { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: string[];
  children: React.ReactNode[];
  className?: string;
}

export function Tabs({ tabs, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-1 border-b border-white/10 pb-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors border-b-2 -mb-[9px]",
              activeTab === index
                ? "text-white border-white"
                : "text-white/50 border-transparent hover:text-white/80"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>{children[activeTab]}</div>
    </div>
  );
}
