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
import { useHooks } from "@/hooks";
import axios from "axios";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });

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
            toast("Unable to reload the card transaction history");
          });
      })
      .catch(() => toast("Unable to delete the data"));
  }

  async function handleFilterByDates() {
    const data = JSON.stringify({
      date_from: date.from.toISOString().split("T")[0],
      date_to: date.to.toISOString().split("T")[0],
    });
    await clientI
      .post("/api/filter-by-dates/", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        setTableData(res.data);
      });
  }

  async function handleReset() {
    await clientII
      .get("/api/card-transaction-history/", {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        setTableData(res.data);
      })
      .catch(() => {
        toast("Unable to reload the card transaction history");
      });
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
        <div className="lg:flex sm:grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
          <div className="sm:flex xsm:flex sm:gap-2 xsm:gap-2">
            <div>
              <Button onClick={handleFilterByDates}>Filter by dates</Button>
            </div>
            <div>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>
          </div>
          <div className="lg:flex sm:grid xsm:grid sm:gap-3 xsm:gap-3">
            <div className="sm:flex xsm:flex sm:gap-3 xsm:gap-3">
              <Button variant="outline" onClick={handleDownloadImage}>
                Download Images
              </Button>
              <Button variant="outline" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
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
