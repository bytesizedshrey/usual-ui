import ComponentDocsPage from "@/components/ComponentDocsPage";
import { vintageKeyboardDoc } from "@/lib/component-docs";

export interface VintageKeyboardDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true. */
  showBackLink?: boolean;
}

function VintageKeyboardDocs({ showBackLink = true }: VintageKeyboardDocsProps) {
  return <ComponentDocsPage doc={vintageKeyboardDoc} showBackLink={showBackLink} />;
}

export default VintageKeyboardDocs;
