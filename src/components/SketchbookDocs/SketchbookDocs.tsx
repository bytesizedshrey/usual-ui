import ComponentDocsPage from "@/components/ComponentDocsPage";
import { sketchbookDoc } from "@/lib/component-docs";

export interface SketchbookDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true. */
  showBackLink?: boolean;
}

function SketchbookDocs({ showBackLink = true }: SketchbookDocsProps) {
  return <ComponentDocsPage doc={sketchbookDoc} showBackLink={showBackLink} />;
}

export default SketchbookDocs;
