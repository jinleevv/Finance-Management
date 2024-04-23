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
  const {
    missingTableData,
    missingBankTableData,
    matchingTableData,
    forceMatchBankData,
    forceMatchUserData,
  } = useHooks();
  const navigate = useNavigate();

  function handleCancel() {
    navigate("/main");
  }

  function handleForceMatch() {
    console.log(forceMatchBankData);
    console.log(forceMatchUserData);
  }

  return (
    <>
      <div className="lg:flex w-full">
        <div className="lg:w-full h-5/6">
          <Card className="h-full m-auto mt-1">
            <CardContent className="mt-5">
              <div className="w-full">
                <div className="w-full">
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    <ArrowLeftIcon />
                  </Button>
                  <div className="lg:flex gap-3">
                    <div className="lg:w-1/2 m-auto">
                      <div className="grid text-center">
                        <Label className="lg:text-lg sm:text-base font-bold">
                          Remaining Items (Your List)
                        </Label>
                        <Label className="text-white">.</Label>
                      </div>
                      <MyMissingDataTable
                        columns={columns}
                        data={missingTableData}
                      />
                    </div>
                    <div className="lg:w-1/2 m-auto">
                      <div className="grid text-center">
                        <Label className="lg:text-lg sm:text-base font-bold">
                          Remaining Items (Bank)
                        </Label>
                        <Label className="-mt-1.5 text-sm font-bold text-red-600">
                          Must be cleared
                        </Label>
                      </div>
                      <MyMissingBankDataTable
                        columns={BankColumns}
                        data={missingBankTableData}
                      />
                    </div>
                  </div>
                  <div className="flex w-full justify-end">
                    <Button
                      size="sm"
                      onClick={handleForceMatch}
                      className="mt-3"
                    >
                      Force Match
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="w-full">
        <Card className="h-full m-auto mt-1">
          <CardContent className="mt-5">
            <div className="lg:flex sm:grid w-full">
              <div className="m-auto">
                <Label className="lg:text-lg sm:text-base font-bold">
                  Matched Transactions
                </Label>
              </div>
            </div>
            <MyMatchingDataTable
              columns={BankColumns}
              data={matchingTableData}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ViewMissingTransactions;
