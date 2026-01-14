/**
 * CSV generation utilities for client-side export
 */

export interface CSVColumn<T> {
  header: string;
  accessor: (item: T) => string | null | undefined;
}

/**
 * Escapes a CSV field value according to RFC 4180
 * - Fields containing commas, double quotes, or newlines are enclosed in double quotes
 * - Double quotes within fields are escaped by doubling them
 */
export function escapeCSVField(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Check if the field needs to be quoted
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    // Escape double quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generates a CSV string from data array and column definitions
 * @param data - Array of items to export
 * @param columns - Column definitions with headers and accessors
 * @param includeBOM - Whether to include UTF-8 BOM for Excel compatibility (default: true)
 */
export function generateCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  includeBOM: boolean = true
): string {
  // Create header row
  const headerRow = columns.map((col) => escapeCSVField(col.header)).join(",");

  // Create data rows
  const dataRows = data.map((item) =>
    columns.map((col) => escapeCSVField(col.accessor(item))).join(",")
  );

  // Combine header and data rows
  const csvContent = [headerRow, ...dataRows].join("\r\n");

  // Add UTF-8 BOM for Excel compatibility
  return includeBOM ? "\uFEFF" + csvContent : csvContent;
}

/**
 * Triggers a browser download of a CSV file
 * @param csvContent - The CSV content string
 * @param filename - The filename for the download
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a filename with the current date
 * @param prefix - Filename prefix (e.g., "contacts")
 * @param extension - File extension (default: "csv")
 * @returns Filename in format: prefix-YYYY-MM-DD.extension
 */
export function generateDateFilename(
  prefix: string,
  extension: string = "csv"
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${prefix}-${year}-${month}-${day}.${extension}`;
}
