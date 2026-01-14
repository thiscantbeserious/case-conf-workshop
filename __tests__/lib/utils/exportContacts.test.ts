import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportContactsToCSV } from "@/lib/utils/exportContacts";
import type { Contact } from "@/lib/client/api";

// Mock the csv utilities
vi.mock("@/lib/utils/csv", () => ({
  generateCSV: vi.fn().mockReturnValue("mocked,csv,content"),
  downloadCSV: vi.fn(),
  generateDateFilename: vi.fn().mockReturnValue("contacts-2024-03-15.csv"),
}));

import { generateCSV, downloadCSV, generateDateFilename } from "@/lib/utils/csv";

describe("exportContactsToCSV", () => {
  const mockContacts: Contact[] = [
    {
      id: "1",
      organisation: "Acme Corp",
      description: "Main client",
      ownerId: "user1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      organisation: "Tech Inc",
      description: null,
      ownerId: "user1",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call generateCSV with contacts and correct columns", () => {
    exportContactsToCSV(mockContacts);

    expect(generateCSV).toHaveBeenCalledTimes(1);
    const [contacts, columns] = vi.mocked(generateCSV).mock.calls[0];

    expect(contacts).toEqual(mockContacts);
    expect(columns).toHaveLength(2);
    expect(columns[0].header).toBe("Organisation");
    expect(columns[1].header).toBe("Description");
  });

  it("should call generateDateFilename with 'contacts' prefix", () => {
    exportContactsToCSV(mockContacts);

    expect(generateDateFilename).toHaveBeenCalledWith("contacts");
  });

  it("should call downloadCSV with generated content and filename", () => {
    exportContactsToCSV(mockContacts);

    expect(downloadCSV).toHaveBeenCalledWith(
      "mocked,csv,content",
      "contacts-2024-03-15.csv"
    );
  });

  it("should extract organisation correctly via column accessor", () => {
    exportContactsToCSV(mockContacts);

    const [, columns] = vi.mocked(generateCSV).mock.calls[0];
    const organisationColumn = columns[0];

    expect(organisationColumn.accessor(mockContacts[0])).toBe("Acme Corp");
    expect(organisationColumn.accessor(mockContacts[1])).toBe("Tech Inc");
  });

  it("should extract description correctly via column accessor", () => {
    exportContactsToCSV(mockContacts);

    const [, columns] = vi.mocked(generateCSV).mock.calls[0];
    const descriptionColumn = columns[1];

    expect(descriptionColumn.accessor(mockContacts[0])).toBe("Main client");
    expect(descriptionColumn.accessor(mockContacts[1])).toBeNull();
  });

  it("should handle empty contacts array", () => {
    exportContactsToCSV([]);

    expect(generateCSV).toHaveBeenCalled();
    const [contacts] = vi.mocked(generateCSV).mock.calls[0];
    expect(contacts).toEqual([]);
  });
});
