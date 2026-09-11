import ComponentDocsPage from "@/components/ComponentDocsPage";
import { vehicleControlSurfaceDoc } from "@/lib/component-docs";

export interface VehicleControlSurfaceDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true. */
  showBackLink?: boolean;
}

function VehicleControlSurfaceDocs({ showBackLink = true }: VehicleControlSurfaceDocsProps) {
  return <ComponentDocsPage doc={vehicleControlSurfaceDoc} showBackLink={showBackLink} />;
}

export default VehicleControlSurfaceDocs;
