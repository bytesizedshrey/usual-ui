import ComponentDocsPage from "@/components/ComponentDocsPage";
import { receiptPrinterDoc } from "@/lib/component-docs";

export interface ReceiptPrinterDocsProps {
  /** Show the "← Back to showcase" navigation link. Defaults to true (standalone page use). */
  showBackLink?: boolean;
}

function ReceiptPrinterDocs({ showBackLink = true }: ReceiptPrinterDocsProps) {
  return <ComponentDocsPage doc={receiptPrinterDoc} showBackLink={showBackLink} />;
}

export default ReceiptPrinterDocs;
