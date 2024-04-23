import { useEffect, useState } from "react";
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
import { useHooks } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DataTableProps<TableData, TValue> {
  columns: ColumnDef<TableData, TValue>[];
  data: TableData[];
}

export function MyMissingBankDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { forceMatchBankData, setForceMatchBankData } = useHooks();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  function handleSelect() {
    const data: any = table.getFilteredSelectedRowModel().rows[0].original;
    const bankData = {
      trans_date: data["trans_date"],
      post_date: data["post_date"],
      billing_amount: data["billing_amount"],
      merchant_name: data["merchant_name"],
      first_name: data["first_name"],
      last_name: data["last_name"],
    };
    setForceMatchBankData(bankData);
  }

  return (
    <>
      <div className="flex w-full h-11 gap-3">
        <div>
          <Button
            onClick={handleSelect}
            size="sm"
            className="mb-2"
            variant="outline"
          >
            Force Match Content For Bank
          </Button>
        </div>
        <Label className="w-full flex gap-2 p-2 mb-2 border rounded-sm overflow-auto">
          Trans Date: {forceMatchBankData.trans_date}, Post Name:{" "}
          {forceMatchBankData.post_date}, Billing Amount:{" "}
          {forceMatchBankData.billing_amount}, Merchant Name:{" "}
          {forceMatchBankData.merchant_name}
        </Label>
      </div>
      <div className="flex first-line:rounded-md border">
        <Table>
          <ScrollArea className="w-full h-[360px] sm:h-[325px] xsm:h-[305px]">
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
      </div>
    </>
  );
}
