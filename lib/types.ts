export type ColumnType = "text" | "number" | "currency";
export type ColumnRole = "id" | "group" | "normal";

export type ColumnDef = {
  id: string;
  name: string;
  type: ColumnType;
  role?: ColumnRole;
};

export type ItemValues = Record<string, string | number | null>;

export type DataBankSummary = {
  id: string;
  name: string;
  description: string | null;
  columns: ColumnDef[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type DataBankDetail = {
  id: string;
  name: string;
  description: string | null;
  columns: ColumnDef[];
  createdAt: string;
  updatedAt: string;
};

export type InventoryItemDto = {
  id: string;
  dataBankId: string;
  values: ItemValues;
  createdAt: string;
  updatedAt: string;
};

export function getIdColumn(columns: ColumnDef[]): ColumnDef | undefined {
  return (
    columns.find((c) => c.role === "id") ||
    columns.find((c) => c.name.toLowerCase() === "model") ||
    columns[0]
  );
}
