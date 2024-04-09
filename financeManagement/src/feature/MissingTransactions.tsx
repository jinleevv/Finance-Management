import { BankColumns } from "@/feature/TransactionTable/table-columns";
import { BankDataTable } from "@/feature/TransactionTable/bank-data-table";
import { useHooks } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const ViewMissingTransactions = () => {
  const { bankTableData } = useHooks();
  const navigate = useNavigate();

  function handleCancel() {
    navigate("/main");
  }

  return (
    <div className="w-full h-full">
      <Card className="lg:w-[950px] sm:w-full m-auto lg:mt-24 sm:mt-5 opacity-90">
        <CardContent className="mt-5">
          <Button variant="outline" onClick={handleCancel} size="sm">
            <ArrowLeftIcon />
          </Button>
          <BankDataTable columns={BankColumns} data={bankTableData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewMissingTransactions;