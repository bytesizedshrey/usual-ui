
import ComponentDocsPage from "@/components/ComponentDocsPage";
import { musicPlayer3DDoc } from "@/lib/component-docs";

export interface MusicPlayer3DDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true. */
  showBackLink?: boolean;
}

function MusicPlayer3DDocs({ showBackLink = true }: MusicPlayer3DDocsProps) {
  return <ComponentDocsPage doc={musicPlayer3DDoc} showBackLink={showBackLink} />;
}

export default MusicPlayer3DDocs;
