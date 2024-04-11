import Navbar from "@/feature/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaceIcon } from "@radix-ui/react-icons";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useHooks } from "@/hooks";

const MainPage = () => {
  const navigate = useNavigate();
  const {
    clientII,
    department,
    setTableData,
    setMissingTableData,
    setMissingBankTableData,
    setMatchingTableData,
  } = useHooks();

  function handleTransactionFrom() {
    navigate("/main/tax-transaction-form");
  }

  function handleViewUploadedTransactions() {
    clientII
      .get("/api/card-transaction-history/")
      .then((res) => {
        setTableData(res.data);
      })
      .catch(() => {
        toast("Unable to update the table");
      });
    navigate("/main/view-uploaded-transactions");
  }

  async function handleMissingTransactions() {
    await clientII.get("/api/missing-transaction-lists/").then((res) => {
      setMissingTableData(res.data);
    });
    await clientII.get("/api/missing-bank-transaction-lists/").then((res) => {
      setMissingBankTableData(res.data);
    });
    await clientII.get("/api/matching-transaction-lists/").then((res) => {
      setMatchingTableData(res.data);
    });
    navigate("/main/missing-transactions");
  }

  function handleFinanceDepartment() {
    if (department == "Finance") {
      navigate("/main/finance-department-features");
    } else {
      toast.error("You do not have permission");
    }
  }

  function handleHappy() {
    const randomNumber = Math.floor(Math.random() * 11);
    if (randomNumber === 0) {
      toast.success("I love you <3");
    } else if (randomNumber === 1) {
      toast.success("You got this!!!!");
    } else if (randomNumber === 2) {
      toast.success("Do your thing and don't care if they like it :)");
    } else if (randomNumber === 3) {
      toast.success(
        "You can, you should, and if you’re brave enough to start, you will"
      );
    } else if (randomNumber === 4) {
      toast.success("Just say yes and you’ll figure it out afterwards");
    } else if (randomNumber === 5) {
      toast.success(
        "Some people look for a beautiful place. Others make a place beautiful"
      );
    } else if (randomNumber === 6) {
      toast.success(
        "Extraordinary things are always hiding in places people never think to look"
      );
    } else if (randomNumber === 7) {
      toast.success("Only in the darkness can you see the stars");
    } else if (randomNumber === 8) {
      toast.success("The most wasted of days is one without laughter");
    } else if (randomNumber === 9) {
      toast.success("Whoever is happy will make others happy too");
    } else if (randomNumber === 10) {
      toast.success("Today is a good day to try");
    }
  }
  return (
    <>
      <Navbar />
      <div className="h-full">
        <Card className="lg:w-1/2 sm:w-full m-auto lg:mt-44 sm:mt-0 shadow-xl lg:opacity-95 sm:opacity-90">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>What would you like to perform?</CardTitle>
              <Button variant="outline" onClick={handleHappy}>
                <FaceIcon />
              </Button>
            </div>
            <CardDescription>Choose a task from down below</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="w-full grid gap-3 p-6 lg:grid-cols-[0.8fr_1fr] sm:grid-cols-1">
              <li className="row-span-3">
                <Button
                  variant="ghost"
                  className="flex h-full w-full items-start select-none flex-col rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-lg hover:shadow-lg"
                  onClick={handleTransactionFrom}
                >
                  <div className="mb-2 mt-4 ml-4 text-lg font-medium text-left">
                    Corporate Card Transaction
                    <p className="text-sm leading-tight text-muted-foreground">
                      Upload a corporate card transaction
                    </p>
                  </div>
                </Button>
              </li>
              <li className="row-span-3">
                <Button
                  variant="ghost"
                  className="flex h-full w-full items-start select-none flex-col rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-lg hover:shadow-lg"
                  onClick={handleViewUploadedTransactions}
                >
                  <div className="mb-2 mt-4 ml-4 text-lg font-medium text-left">
                    View Uploaded Transactions
                    <p className="text-sm leading-tight text-muted-foreground">
                      View Uploaded Transactions
                    </p>
                  </div>
                </Button>
              </li>
              <li className="row-span-3">
                <Button
                  variant="ghost"
                  className="flex h-full w-full items-start select-none flex-col rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-lg hover:shadow-lg"
                  onClick={handleMissingTransactions}
                >
                  <div className="mb-2 mt-4 ml-4 text-lg font-medium text-left">
                    Missing Transactions
                    <p className="text-sm leading-tight text-muted-foreground">
                      Missing Transactions
                    </p>
                  </div>
                </Button>
              </li>
              <li className="row-span-3">
                <Button
                  variant="ghost"
                  className="flex h-full w-full items-start select-none flex-col rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-lg hover:shadow-lg"
                  onClick={handleFinanceDepartment}
                >
                  <div className="mb-2 mt-4 ml-4 text-lg font-medium text-left">
                    Finance Department
                    <p className="text-sm leading-tight text-muted-foreground">
                      Finance Department
                    </p>
                  </div>
                </Button>
              </li>
            </ul>
            <Toaster richColors closeButton />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MainPage;
