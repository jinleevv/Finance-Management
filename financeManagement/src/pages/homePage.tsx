import Navbar from "@/feature/Navbar";
import { Button } from "@/components/ui/button";
import { BackpackIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { useHooks } from "@/hooks";
import { HomePageAnimation } from "@/feature/HomePageAnimation";

const HomePage = () => {
  const navigate = useNavigate();
  const { logedInUser } = useHooks();

  function handleClick() {
    if (!logedInUser) {
      navigate("/login");
    } else {
      navigate("/main");
    }
  }

  return (
    <div className="w-full h-full">
      <Navbar />
      <div className="grid">
        <p className="w-full h-1/2 translate-y-1/3 mt-40 mb-4">
          <HomePageAnimation />
        </p>
        <Button
          className="w-auto translate-y-12 m-auto text-[18px] gap-3"
          onClick={handleClick}
        >
          <BackpackIcon className="mt-0.5" />
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
