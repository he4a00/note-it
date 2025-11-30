import { BlockNoteEditor } from "@blocknote/core";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import * as ReactPDF from "@react-pdf/renderer";

/**
 * Exports a BlockNote document to PDF and triggers a download
 * @param editor - The BlockNote editor instance
 * @param filename - The desired filename for the PDF (without extension)
 * @throws Error if PDF generation fails
 */
export async function exportToPDF(
  editor: BlockNoteEditor,
  filename: string = "document"
): Promise<void> {
  try {
    // Create the PDF exporter with the editor's schema
    const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);

    // Convert the editor's document to a React-PDF document
    const pdfDocument = await exporter.toReactPDFDocument(editor.document);

    // Generate the PDF as a blob
    const blob = await ReactPDF.pdf(pdfDocument).toBlob();

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
}
