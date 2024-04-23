import Navbar from "@/feature/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { FaceIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useHooks } from "@/hooks";
import { MainPageSectionButton } from "@/feature/MainPageFeatures/MainPageSectionButton";

const FinanceDepartmentFeatures = () => {
  const navigate = useNavigate();
  const { clientI, department, setBankTableData } = useHooks();

  function handleDownloadLists() {
    if (department === "Finance") {
      navigate("/main/download-transaction");
      return 1;
    } else {
      toast.error("You do not have permission");
      return 0;
    }
  }

  function handleUploadBankTransactionLists() {
    if (department === "Finance") {
      navigate("/main/upload-bank-transaction-lists");
      return 1;
    } else {
      toast.error("You do not have permission");
      return 0;
    }
  }

  function handleViewBankTransactionLists() {
    if (department === "Finance") {
      clientI.get("/api/upload-bank-transaction-list/").then((res) => {
        setBankTableData(res.data);
      });
      navigate("/main/view-bank-transaction-lists");
      return 1;
    } else {
      toast.error("You do not have permission");
      return 0;
    }
  }

  function handleMainPage() {
    navigate("/main");
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
      <div className="w-full h-full m-auto">
        <Navbar />
        <div className="h-full">
          <Card className="lg:w-1/2 sm:w-full m-auto lg:mt-28 sm:mt-0 shadow-xl rounded-3xl">
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
              <div className="lg:flex gap-8 mb-4 sm:space-y-3 xsm:space-y-3">
                <MainPageSectionButton
                  title={"Upload Bank Transaction Lists"}
                  description={"Upload Bank Transaction Lists"}
                  handleFunction={handleUploadBankTransactionLists}
                />
                <MainPageSectionButton
                  title={"Download Transaction Lists"}
                  description={"Download Transaction Lists"}
                  handleFunction={handleDownloadLists}
                />
              </div>
              <div>
                <MainPageSectionButton
                  title={"Bank Transaction Lists"}
                  description={"Bank Transaction Lists"}
                  handleFunction={handleViewBankTransactionLists}
                />
              </div>
              <Toaster richColors closeButton />
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-end">
                <Button className="justify-end" onClick={handleMainPage}>
                  Main Page
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FinanceDepartmentFeatures;
