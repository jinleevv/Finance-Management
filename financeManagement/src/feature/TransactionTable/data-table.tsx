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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHooks } from "@/hooks";
import { addDays, format, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { saveAs } from "file-saver";

interface DataTableProps<TableData, TValue> {
  columns: ColumnDef<TableData, TValue>[];
  data: TableData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { clientI, clientII, userFirstName, userLastName, setTableData } =
    useHooks();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
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
      first_name: userFirstName,
      last_name: userLastName,
    });
    await clientI
      .post("/api/filter-by-dates/", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        setTableData(res.data);
      })
      .catch(() => {
        toast("Unable to filter by given dates");
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

    if (data.length < 1) {
      toast("Please select at least one data to download image(s)");
    } else {
      const todayDate = new Date();
      const todayDateString = todayDate.toISOString().split("T")[0];
      const filenames = data.map((element: any) => element.original["img"]);

      try {
        const response = await clientI
          .post(
            "/api/receipt-download/",
            {
              filenames: filenames,
            },
            { responseType: "blob" }
          )
          .catch(() => {
            toast("Error downloading images:");
          });

        const blob = new Blob([response.data], { type: "application/zip" });
        saveAs(blob, `images_${todayDateString}.zip`);
      } catch (error) {
        toast("Error downloading images");
      }
    }
  }

  return (
    <>
      <div className="lg:flex sm:grid gap-2 justify-between mb-2">
        <div className="lg:flex w-full gap-2 sm:space-y-2 xsm:space-y-2">
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
          <div className="flex gap-1">
            <Button onClick={handleFilterByDates}>Filter by dates</Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </div>
        <div className="w-full flex gap-1 lg:justify-end">
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
