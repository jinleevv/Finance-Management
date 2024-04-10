import Navbar from "@/feature/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { FaceIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useHooks } from "@/hooks";
import AnimatedButton from "./animatedButton";

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

  {
    /* <div className="flex translate-y-56 items-center h-full justify-center">
        <animated.div
          ref={target}
          className="relative w-[200px] h-[200px] rounded-md bg-white shadow-md transition-shadow-opacity will-change-transform border-4 border-white cursor-grab overflow-hidden touch-action-none hover:shadow-2xl"
          style={{
            transform: "perspective(600px)",
            x,
            y,
            scale: to([scale, zoom], (s, z) => s + z),
            rotateX,
            rotateY,
            rotateZ,
          }}
        >
          <Button className="w-full h-full">Bank Transaction Lists</Button>
        </animated.div>
      </div> */
  }

  return (
    <>
      <div className="w-full h-full m-auto">
        <Navbar />
        <div className="h-full">
          <Card className="lg:w-1/2 sm:w-full m-auto lg:mt-28 sm:mt-0 shadow-xl lg:opacity-95 sm:opacity-90">
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
              <div className="flex gap-8 mb-4">
                <AnimatedButton
                  title={"Upload Bank Transaction Lists"}
                  description={"Upload Bank Transaction Lists"}
                  handleFunc={handleUploadBankTransactionLists}
                />
                <AnimatedButton
                  title={"Download Transaction Lists"}
                  description={"Download Transaction Lists"}
                  handleFunc={handleDownloadLists}
                />
              </div>
              <div>
                <AnimatedButton
                  title={"Bank Transaction Lists"}
                  description={"Bank Transaction Lists"}
                  handleFunc={handleViewBankTransactionLists}
                />
              </div>
              {/* <ul className="w-full grid gap-3 p-6 lg:grid-cols-[0.8fr_1fr] sm:grid-cols-1">
              <li className="row-span-3">
                <Button
                  variant="ghost"
                  className="flex h-full w-full items-start select-none flex-col rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-lg hover:shadow-lg"
                  onClick={handleUploadBankTransactionLists}
                >
                  <div className="mb-2 mt-4 ml-4 text-lg font-medium text-left">
                    Upload Bank Transaction Lists
                    <p className="text-sm leading-tight text-muted-foreground">
                    Upload Bank Transaction Lists
                    </p>
                  </div>
                </Button>
              </li>
              <li className="row-span-3">
                <Button
                  variant="ghost"
                  className="flex h-full w-full items-start select-none flex-col rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-lg hover:shadow-lg"
                  onClick={handleDownloadLists}
                >
                  <div className="mb-2 mt-4 ml-4 text-lg font-medium text-left">
                    Download Transaction Lists
                    <p className="text-sm leading-tight text-muted-foreground">
                      Download Transaction Lists
                    </p>
                  </div>
                </Button>
              </li>
              </ul>
              <ul className="w-full grid gap-3 p-6 grid-cols-1 -mt-6">
              <li className="row-span-1">
                <Button
                  variant="ghost"
                  className="flex h-full w-full text-center select-none flex-col rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-lg hover:shadow-lg"
                  onClick={handleViewBankTransactionLists}
                >
                  <div className="mb-2 mt-4 ml-4 text-lg font-medium">
                    Bank Transaction Lists
                    <p className="text-sm leading-tight text-muted-foreground">
                    Bank Transaction Lists
                    </p>
                  </div>
                </Button>
              </li>
              </ul> */}
              <Toaster richColors closeButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FinanceDepartmentFeatures;
