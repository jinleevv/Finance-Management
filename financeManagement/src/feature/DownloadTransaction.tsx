import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import { ArrowLeftIcon, CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useHooks } from "@/hooks";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export function DownloadTransaction({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const navigate = useNavigate();
  const { clientI, department } = useHooks();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 20),
  });

  function handleCancel() {
    navigate("/main/finance-department-features");
  }

  async function handleClick() {
    try {
      const data = JSON.stringify({
        date_from: date.from.toISOString().split("T")[0],
        date_to: date.to.toISOString().split("T")[0],
        department: department,
      });

      await clientI
        .post("/api/download-transaction/", data, {
          headers: { "Content-Type": "application/json" },
        })
        .then((res) => {
          if (res.data.data.length !== 0) {
            const jsonData = res.data.data;

            const cleanedData = jsonData.map(
              ({ id, ...rest }: { id: any }) => rest
            );

            const worksheet = XLSX.utils.json_to_sheet(cleanedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

            // Buffer to store the generated Excel file
            const excelBuffer = XLSX.write(workbook, {
              bookType: "xlsx",
              type: "array",
            });
            const blob = new Blob([excelBuffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
            });

            const nameDate = new Date();
            const fileDownloadName =
              "Transactions_List_" +
              nameDate.toISOString().split("T")[0] +
              ".xlsx";
            saveAs(blob, fileDownloadName);
          } else {
            toast("There is no data that intersect with each other");
          }
        });
    } catch (err) {
      toast("Something went wront");
    }
  }

  return (
    <Card className="w-[500px] sm:w-full xsm:w-full m-auto mt-24 sm:mt-0 xsm:mt-0">
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Download Transaction List</CardTitle>
          <Button variant="outline" onClick={handleCancel} size="sm">
            <ArrowLeftIcon />
          </Button>
        </div>
        <CardDescription>Download the list in excel file</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-2", className)}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[430px] sm:w-full xsm:w-full h-full justify-start text-left font-normal",
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
            <PopoverContent className="w-auto" align="start">
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
        </div>
        <CardFooter className="w-full mt-3 -ml-6 justify-end">
          <Button
            onClick={handleClick}
            className="lg:-mr-7 sm:-mr-12 xsm:-mr-12"
          >
            Download
          </Button>
        </CardFooter>
        <Toaster />
      </CardContent>
    </Card>
  );
}
