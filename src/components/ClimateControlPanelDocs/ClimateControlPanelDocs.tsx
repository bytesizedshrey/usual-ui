import ComponentDocsPage from "@/components/ComponentDocsPage";
import { climateControlPanelDoc } from "@/lib/component-docs";

export interface ClimateControlPanelDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true. */
  showBackLink?: boolean;
}

function ClimateControlPanelDocs({ showBackLink = true }: ClimateControlPanelDocsProps) {
  return <ComponentDocsPage doc={climateControlPanelDoc} showBackLink={showBackLink} />;
}

export default ClimateControlPanelDocs;
