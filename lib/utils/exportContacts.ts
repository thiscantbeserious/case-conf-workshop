/**
 * Contact-specific CSV export utility
 */

import { type Contact } from "@/lib/client/api";
import {
  generateCSV,
  downloadCSV,
  generateDateFilename,
  type CSVColumn,
} from "./csv";

/**
 * Column definitions for contacts CSV export
 */
const contactColumns: CSVColumn<Contact>[] = [
  {
    header: "Organisation",
    accessor: (contact) => contact.organisation,
  },
  {
    header: "Description",
    accessor: (contact) => contact.description,
  },
];

/**
 * Exports contacts to a CSV file and triggers download
 * @param contacts - Array of contacts to export
 */
export function exportContactsToCSV(contacts: Contact[]): void {
  const csvContent = generateCSV(contacts, contactColumns);
  const filename = generateDateFilename("contacts");
  downloadCSV(csvContent, filename);
}
