import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHooks } from "@/hooks";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface DataTableProps<TableData, TValue> {
  columns: ColumnDef<TableData, TValue>[];
  data: TableData[];
}

export function BankDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { clientI, clientII, setBankTableData } = useHooks();
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

  function preHandleDelete() {
    const data = table.getFilteredSelectedRowModel().rows;

    if (data.length === 0) {
      toast("Unable to delete the data, please only select at least one item");
    }
  }

  async function handleDelete() {
    const data = table.getFilteredSelectedRowModel().rows;

    await clientI
      .post("/api/delete-bank-data/", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        clientII
          .get("/api/upload-bank-transaction-list/", {
            headers: { "Content-Type": "application/json" },
          })
          .then((res) => {
            setBankTableData(res.data);
          })
          .catch(() => {
            toast("Unable to reload the bank transaction lists");
          });
      })
      .catch(() => toast("Unable to delete the data"));
  }

  return (
    <>
      <div className="flex items-center py-4 justify-between">
        <Input
          placeholder="Filter by First Name..."
          value={
            (table.getColumn("first_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("first_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-3">
          {table.getFilteredSelectedRowModel().rows.length > 0 ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Delete</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-xl">
                <DialogHeader>
                  <DialogTitle>Delete</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete? You cannot undo the action.
                  </DialogDescription>
                </DialogHeader>{" "}
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Alert</AlertTitle>
                  <AlertDescription>
                    Are you sure you want to delete? You cannot undo the action.
                  </AlertDescription>
                </Alert>
                <DialogFooter>
                  <Button onClick={handleDelete}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" onClick={preHandleDelete}>
              Delete
            </Button>
          )}
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
