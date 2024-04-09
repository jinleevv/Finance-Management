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
        <p className="w-full h-1/2 translate-y-20 mt-40 mb-4 font-semibold lg:text-[90px] sm:text-[60px] text-center bg-gradient-to-r from-teal-400 to-indigo-400 inline-block text-transparent bg-clip-text m-auto">
          <HomePageAnimation />
          {/* Finance Management */}
        </p>
        <Button
          className="w-auto translate-y-20 m-auto text-[18px] gap-3"
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
