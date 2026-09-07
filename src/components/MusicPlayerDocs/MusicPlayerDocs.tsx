import ComponentDocsPage from "@/components/ComponentDocsPage";
import { musicPlayerDoc } from "@/lib/component-docs";

export interface MusicPlayerDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true (standalone page use). */
  showBackLink?: boolean;
}

function MusicPlayerDocs({ showBackLink = true }: MusicPlayerDocsProps) {
  return <ComponentDocsPage doc={musicPlayerDoc} showBackLink={showBackLink} />;
}

export default MusicPlayerDocs;
