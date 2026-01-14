import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  escapeCSVField,
  generateCSV,
  downloadCSV,
  generateDateFilename,
  type CSVColumn,
} from "@/lib/utils/csv";

describe("csv utilities", () => {
  describe("escapeCSVField", () => {
    it("should return empty string for null", () => {
      expect(escapeCSVField(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(escapeCSVField(undefined)).toBe("");
    });

    it("should return simple string unchanged", () => {
      expect(escapeCSVField("simple text")).toBe("simple text");
    });

    it("should wrap field containing comma in double quotes", () => {
      expect(escapeCSVField("hello, world")).toBe('"hello, world"');
    });

    it("should wrap field containing double quote and escape inner quotes", () => {
      expect(escapeCSVField('say "hello"')).toBe('"say ""hello"""');
    });

    it("should wrap field containing newline in double quotes", () => {
      expect(escapeCSVField("line1\nline2")).toBe('"line1\nline2"');
    });

    it("should wrap field containing carriage return in double quotes", () => {
      expect(escapeCSVField("line1\rline2")).toBe('"line1\rline2"');
    });

    it("should handle field with multiple special characters", () => {
      expect(escapeCSVField('hello, "world"\nnew line')).toBe(
        '"hello, ""world""\nnew line"'
      );
    });

    it("should handle empty string", () => {
      expect(escapeCSVField("")).toBe("");
    });
  });

  describe("generateCSV", () => {
    interface TestItem {
      name: string;
      value: number | null;
    }

    const columns: CSVColumn<TestItem>[] = [
      { header: "Name", accessor: (item) => item.name },
      { header: "Value", accessor: (item) => item.value?.toString() },
    ];

    it("should generate CSV with header row", () => {
      const data: TestItem[] = [];
      const csv = generateCSV(data, columns, false);
      expect(csv).toBe("Name,Value");
    });

    it("should generate CSV with data rows", () => {
      const data: TestItem[] = [
        { name: "Item 1", value: 100 },
        { name: "Item 2", value: 200 },
      ];
      const csv = generateCSV(data, columns, false);
      expect(csv).toBe("Name,Value\r\nItem 1,100\r\nItem 2,200");
    });

    it("should handle null values in data", () => {
      const data: TestItem[] = [{ name: "Item with null", value: null }];
      const csv = generateCSV(data, columns, false);
      expect(csv).toBe("Name,Value\r\nItem with null,");
    });

    it("should escape special characters in data", () => {
      const data: TestItem[] = [{ name: "Item, with comma", value: 42 }];
      const csv = generateCSV(data, columns, false);
      expect(csv).toBe('Name,Value\r\n"Item, with comma",42');
    });

    it("should include UTF-8 BOM when requested", () => {
      const data: TestItem[] = [];
      const csv = generateCSV(data, columns, true);
      expect(csv.charCodeAt(0)).toBe(0xfeff);
    });

    it("should include UTF-8 BOM by default", () => {
      const data: TestItem[] = [];
      const csv = generateCSV(data, columns);
      expect(csv.charCodeAt(0)).toBe(0xfeff);
    });

    it("should not include UTF-8 BOM when explicitly disabled", () => {
      const data: TestItem[] = [];
      const csv = generateCSV(data, columns, false);
      expect(csv.charCodeAt(0)).not.toBe(0xfeff);
    });
  });

  describe("downloadCSV", () => {
    let mockCreateElement: ReturnType<typeof vi.fn>;
    let mockAppendChild: ReturnType<typeof vi.fn>;
    let mockRemoveChild: ReturnType<typeof vi.fn>;
    let mockClick: ReturnType<typeof vi.fn>;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
    let mockLink: Partial<HTMLAnchorElement>;

    beforeEach(() => {
      mockClick = vi.fn();
      mockLink = {
        href: "",
        download: "",
        style: { display: "" } as CSSStyleDeclaration,
        click: mockClick,
      };

      mockCreateElement = vi.fn().mockReturnValue(mockLink);
      mockAppendChild = vi.fn();
      mockRemoveChild = vi.fn();
      mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      mockRevokeObjectURL = vi.fn();

      document.createElement = mockCreateElement;
      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;
      URL.createObjectURL = mockCreateObjectURL;
      URL.revokeObjectURL = mockRevokeObjectURL;
    });

    it("should create a download link with correct attributes", () => {
      downloadCSV("test,data", "test.csv");

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockLink.download).toBe("test.csv");
      expect(mockLink.style?.display).toBe("none");
    });

    it("should create a Blob with correct content type", () => {
      downloadCSV("test,data", "export.csv");

      expect(mockCreateObjectURL).toHaveBeenCalled();
      const blob = mockCreateObjectURL.mock.calls[0][0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("text/csv;charset=utf-8;");
    });

    it("should trigger click on the download link", () => {
      downloadCSV("content", "file.csv");
      expect(mockClick).toHaveBeenCalled();
    });

    it("should clean up after download", () => {
      downloadCSV("content", "file.csv");

      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("generateDateFilename", () => {
    beforeEach(() => {
      // Mock the Date constructor to return a fixed date
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
    });

    it("should generate filename with current date", () => {
      const filename = generateDateFilename("contacts");
      expect(filename).toBe("contacts-2024-03-15.csv");
    });

    it("should pad month with leading zero", () => {
      vi.setSystemTime(new Date("2024-01-05T12:00:00Z"));
      const filename = generateDateFilename("data");
      expect(filename).toBe("data-2024-01-05.csv");
    });

    it("should pad day with leading zero", () => {
      vi.setSystemTime(new Date("2024-12-09T12:00:00Z"));
      const filename = generateDateFilename("export");
      expect(filename).toBe("export-2024-12-09.csv");
    });

    it("should use default csv extension", () => {
      const filename = generateDateFilename("report");
      expect(filename).toMatch(/\.csv$/);
    });

    it("should allow custom extension", () => {
      const filename = generateDateFilename("report", "xlsx");
      expect(filename).toBe("report-2024-03-15.xlsx");
    });

    afterEach(() => {
      vi.useRealTimers();
    });
  });
});
