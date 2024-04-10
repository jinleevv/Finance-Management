import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import logo from "@/assets/ultium_Cam_horiz_primary.png";
import { useHooks } from "@/hooks";
import { ProfileMenu } from "./Profile";
import { useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const Navbar = () => {
  const {
    logedInUser,
    setLogedInUser,
    setUserName,
    setUserEmail,
    setDepartment,
  } = useHooks();
  const { theme } = useTheme();
  const { clientII } = useHooks();

  const darkModeClassName =
    "flex sm:w-full sm:h-full sm:m-auto relative z-50 p-6 py-4  w-full items-center justify-between space-x-6 shadow-lg bg-black opacity-95";
  const lightModeClassName =
    "flex sm:w-full sm:h-full sm:m-auto relative z-50 p-6 py-4  w-full items-center justify-between space-x-6 shadow-md bg-white opacity-95";

  useEffect(() => {
    clientII
      .get("/api/sessionid-exist/")
      .then((res) => {
        if (res.status === 204) {
          toast(
            "Please log in to the website. Either your session is expired or you are not logged in",
            { id: 1 }
          );
          setLogedInUser(false);
        } else {
          clientII
            .get("/api/user/")
            .then((res) => {
              const first_name = res.data.user.first_name;
              const last_name = res.data.user.last_name;
              setUserName(first_name + " " + last_name);
              setUserEmail(res.data.user.email);
              setDepartment(res.data.user.department);
              setLogedInUser(true);
            })
            .catch(() => {
              setLogedInUser(false);
            });
        }
      })
      .catch(() => {
        setLogedInUser(false);
        toast("Something went wrong", { id: 1 });
      });
  });

  return (
    <>
      <nav className={theme == "dark" ? darkModeClassName : lightModeClassName}>
        <Link to="/">
          <img src={logo} alt="Ultium CAM logo" className="h-auto w-40" />
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <div className="mt-0.5 mr-3">
              <Link to="https://quickbooks.intuit.com/ca/" target="_blank">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0m.642 4.134c.955 0 1.73.775 1.73 1.733v9.066h1.6a2.934 2.934 0 0 0 0-5.866h-.666V7.333h.665A4.663 4.663 0 0 1 20.63 12a4.662 4.662 0 0 1-4.658 4.667h-3.329zM7.984 7.333h3.329v12.533c-.956 0-1.73-.776-1.73-1.733V9.066h-1.6a2.934 2.934 0 0 0 0 5.867h.666v1.733h-.665A4.662 4.662 0 0 1 3.326 12a4.662 4.662 0 0 1 4.658-4.667"
                  />
                </svg>
              </Link>
            </div>
            <ModeToggle></ModeToggle>
            {logedInUser ? (
              <ProfileMenu />
            ) : (
              <Link to="/login">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Login
                </NavigationMenuLink>
              </Link>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
      <Toaster />
    </>
  );
};

export default Navbar;
