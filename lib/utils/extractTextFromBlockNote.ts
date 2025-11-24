/**
 * Extracts plain text from BlockNote JSON content
 * @param content - The stringified BlockNote JSON content
 * @param maxLength - Maximum length of text to return (default: 150)
 * @returns Plain text extracted from the content
 */
export function extractTextFromBlockNote(
  content: string,
  maxLength: number = 150
): string {
  try {
    const blocks = JSON.parse(content);

    if (!Array.isArray(blocks)) {
      return "";
    }

    // Extract text from all blocks
    const textParts: string[] = [];

    blocks.forEach((block: any) => {
      if (block.content && Array.isArray(block.content)) {
        block.content.forEach((contentItem: any) => {
          if (contentItem.type === "text" && contentItem.text) {
            textParts.push(contentItem.text);
          }
        });
      }
    });

    const fullText = textParts.join(" ").trim();

    // Truncate if needed
    if (fullText.length > maxLength) {
      return fullText.substring(0, maxLength) + "...";
    }

    return fullText || "Empty note";
  } catch (error) {
    console.error("Error parsing BlockNote content:", error);
    return "Unable to preview content";
  }
}
