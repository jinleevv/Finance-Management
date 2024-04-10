import { columns, BankColumns } from "@/feature/TransactionTable/table-columns";
import { useHooks } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { MyMissingDataTable } from "./TransactionTable/my-missing-data-table";
import { MyMissingBankDataTable } from "./TransactionTable/my-missing-bank-data-table";
import { MyMatchingDataTable } from "./TransactionTable/my-matching-data-table";

const ViewMissingTransactions = () => {
  const { missingTableData, missingBankTableData, matchingTableData } =
    useHooks();
  const navigate = useNavigate();

  function handleCancel() {
    navigate("/main");
  }

  return (
    <>
      <div className="flex w-full">
        <div className="w-1/2 h-5/6">
          <Card className="h-full m-auto mt-1 opacity-90">
            <CardContent className="mt-5">
              <div className="lg:flex sm:grid w-full">
                <Button variant="outline" onClick={handleCancel} size="sm">
                  <ArrowLeftIcon />
                </Button>
                <div className="m-auto">
                  <Label className="lg:text-lg sm:text-base font-bold">
                    Missing Transaction Lists
                  </Label>
                </div>
              </div>
              <MyMissingDataTable columns={columns} data={missingTableData} />
            </CardContent>
          </Card>
        </div>
        <div className="w-1/2 h-5/6">
          <Card className="h-full m-auto mt-1 opacity-90">
            <CardContent className="mt-5">
              <div className="lg:flex sm:grid w-full">
                <Button variant="outline" onClick={handleCancel} size="sm">
                  <ArrowLeftIcon />
                </Button>
                <div className="m-auto">
                  <Label className="lg:text-lg sm:text-base font-bold">
                    Missing Bank Transaction Lists
                  </Label>
                </div>
              </div>
              <MyMissingBankDataTable
                columns={BankColumns}
                data={missingBankTableData}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="w-full">
        <Card className="h-full m-auto mt-1 opacity-90">
          <CardContent className="mt-5">
            <div className="lg:flex sm:grid w-full">
              <Button variant="outline" onClick={handleCancel} size="sm">
                <ArrowLeftIcon />
              </Button>
              <div className="m-auto">
                <Label className="lg:text-lg sm:text-base font-bold">
                  Matching Transaction Lists
                </Label>
              </div>
            </div>
            <MyMatchingDataTable columns={columns} data={matchingTableData} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ViewMissingTransactions;
