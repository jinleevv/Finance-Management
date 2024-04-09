import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHooks } from "@/hooks";
import axios from "axios";

interface DataTableProps<TableData, TValue> {
  columns: ColumnDef<TableData, TValue>[];
  data: TableData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { clientI, clientII, urlII, setTableData } = useHooks();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      rowSelection,
      columnFilters,
    },
  });

  async function handleDelete() {
    const data = table.getFilteredSelectedRowModel().rows;

    await clientI
      .post("/api/delete-card-data/", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        clientII
          .get("/api/card-transaction-history/", {
            headers: { "Content-Type": "application/json" },
          })
          .then((res) => {
            setTableData(res.data);
          })
          .catch(() => {
            toast("Unable to reload the card transaction history")
          });
      })
      .catch(() => toast("Unable to delete the data"));
  }

  async function handleDownloadImage() {
    const data = table.getFilteredSelectedRowModel().rows;
    data.forEach((element) => {
      let filename = element.original["img"];
      const url = urlII + "/api/download/" + filename;

      axios({
        url: url,
        method: "GET",
        responseType: "blob",
      })
        .then((response) => {
          // Create a blob URL for the file

          const url = window.URL.createObjectURL(new Blob([response.data]));

          // Create a link element to trigger the download
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename.replace("uploads/", ""));

          // Append the link to the body and click it to start the download
          document.body.appendChild(link);
          link.click();

          // Cleanup: Remove the link and revoke the blob URL
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => console.error("Error downloading file:", error));
    });
  }
  return (
    <>
      <div className="flex items-center py-4 justify-between">
        <Input
          placeholder="Filter Merchant Name..."
          value={
            (table.getColumn("merchant_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("merchant_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadImage}>
            Download Images
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
      <div className="flex first-line:rounded-md border">
        <Table>
          <ScrollArea className="w-full h-[400px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </Table>
        <Toaster />
      </div>
    </>
  );
}
