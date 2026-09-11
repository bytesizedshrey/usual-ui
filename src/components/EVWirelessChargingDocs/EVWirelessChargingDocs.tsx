import ComponentDocsPage from "@/components/ComponentDocsPage";
import { evWirelessChargingDoc } from "@/lib/component-docs";

export interface EVWirelessChargingDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true. */
  showBackLink?: boolean;
}

function EVWirelessChargingDocs({ showBackLink = true }: EVWirelessChargingDocsProps) {
  return <ComponentDocsPage doc={evWirelessChargingDoc} showBackLink={showBackLink} />;
}

export default EVWirelessChargingDocs;
