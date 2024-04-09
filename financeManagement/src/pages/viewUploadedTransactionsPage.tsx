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
      <Card className="lg:w-[950px] sm:w-full m-auto lg:mt-24 sm:mt-5 opacity-90">
        <CardContent className="mt-5">
          <Button variant="outline" onClick={handleCancel} size="sm">
            <ArrowLeftIcon />
          </Button>
          <DataTable columns={columns} data={tableData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewUploadedTransactionsPage;
