import ComponentDocsPage from "@/components/ComponentDocsPage";
import { savingsChallengeCardDoc } from "@/lib/component-docs";

export interface SavingsChallengeCardDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true (standalone page use). */
  showBackLink?: boolean;
}

function SavingsChallengeCardDocs({ showBackLink = true }: SavingsChallengeCardDocsProps) {
  return <ComponentDocsPage doc={savingsChallengeCardDoc} showBackLink={showBackLink} />;
}

export default SavingsChallengeCardDocs;
