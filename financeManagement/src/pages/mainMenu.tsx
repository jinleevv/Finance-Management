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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useHooks } from "@/hooks";
import { MainPageSectionButton } from "@/feature/MainPageFeatures/MainPageSectionButton";
import { startOfMonth } from "date-fns";

const MainPage = () => {
  const navigate = useNavigate();
  const {
    clientII,
    department,
    setCalenderDate,
    setTableData,
    setMissingTableData,
    setMissingBankTableData,
    setMatchingTableData,
  } = useHooks();

  function handleTransactionFrom() {
    navigate("/main/tax-transaction-form");
    return 1;
  }

  async function handleViewUploadedTransactions() {
    await clientII
      .get("/api/card-transaction-history/")
      .then((res) => {
        setTableData(res.data);
      })
      .catch(() => {
        toast("Unable to update the table");
      });
    setCalenderDate({
      from: startOfMonth(new Date()),
      to: new Date(),
    })
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
      return 1;
    } else {
      toast.error("You do not have permission");
      return 0;
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
      <div className="h-svh">
        <Navbar />
        <Card className="lg:w-1/2 sm:w-full m-auto lg:mt-32 sm:mt-0 rounded-3xl sm:rounded-t-none xsm:rounded-t-none">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>What would you like to perform?</CardTitle>
              <Button variant="outline" onClick={handleHappy}>
                <FaceIcon />
              </Button>
            </div>
            <CardDescription>Choose an option from down below</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="w-full grid rounded-md gap-5 lg:grid-cols-2 sm:grid-cols-1">
              <li className="row-span-3">
                <MainPageSectionButton
                  title={"Corporate Card Transaction"}
                  description={"Upload a corporate card transaction"}
                  handleFunction={handleTransactionFrom}
                />
              </li>
              <li className="row-span-3">
                <MainPageSectionButton
                  title={"View Uploaded Transactions"}
                  description={"View Uploaded Transactions"}
                  handleFunction={handleViewUploadedTransactions}
                />
              </li>
              <li className="row-span-3">
                <MainPageSectionButton
                  title={"Missing Transactions"}
                  description={"View Missing Transactions"}
                  handleFunction={handleMissingTransactions}
                />
              </li>
              <li className="row-span-3">
                <MainPageSectionButton
                  title={"Finance Department"}
                  description={"Finance Department"}
                  handleFunction={handleFinanceDepartment}
                />
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MainPage;
