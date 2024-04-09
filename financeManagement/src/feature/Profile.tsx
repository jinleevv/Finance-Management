import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHooks } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { PersonIcon } from "@radix-ui/react-icons";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export function ProfileMenu() {
  const { clientII, setLogedInUser, setTableData } = useHooks();
  const navigate = useNavigate();

  function handleLogout(e: any) {
    e.preventDefault();
    clientII.post("/api/logout/", { withCredentials: true }).then(() => {
      setLogedInUser(false);
      navigate("/");
    });
  }

  function handleSettings(e: any) {
    e.preventDefault();
    navigate("/main/settings");
  }
  function handleView(e: any) {
    e.preventDefault();
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="hover:shadow-lg">
            <AvatarFallback>
              <PersonIcon />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleView}>
              View Uploaded Transactions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings}>
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Toaster />
    </>
  );
}
