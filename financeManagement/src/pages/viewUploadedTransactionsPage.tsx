import Navbar from "@/feature/Navbar";
import { columns } from "@/feature/TransactionTable/table-columns";
import { DataTable } from "@/feature/TransactionTable/data-table";
import { useHooks } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const ViewUploadedTransactionsPage = () => {
  const { tableData } = useHooks();
  const navigate = useNavigate();

  function handleCancel() {
    navigate("/main");
  }

  return (
    <div className="w-full h-full">
      <Navbar />
      <Card className="lg:w-[950px] sm:w-full xsm:w-full m-auto lg:mt-24 sm:mt-0 xsm:mt-0">
        <CardContent className="mt-5">
          <div className="lg:flex mb-3 w-full justify-end">
            <Button variant="outline" onClick={handleCancel} size="sm">
              <ArrowLeftIcon />
            </Button>
          </div>

          <DataTable columns={columns} data={tableData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewUploadedTransactionsPage;
