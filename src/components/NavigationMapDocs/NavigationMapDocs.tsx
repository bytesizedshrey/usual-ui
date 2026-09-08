import ComponentDocsPage from "@/components/ComponentDocsPage";
import { navigationMapDoc } from "@/lib/component-docs";

export interface NavigationMapDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true. */
  showBackLink?: boolean;
}

function NavigationMapDocs({ showBackLink = true }: NavigationMapDocsProps) {
  return <ComponentDocsPage doc={navigationMapDoc} showBackLink={showBackLink} />;
}

export default NavigationMapDocs;
