import { LoginCard } from "@/feature/LoginCard";
import Navbar from "@/feature/Navbar";

const LoginPage = () => {
  return (
    <div className="w-full h-full m-auto">
      <Navbar />
      <LoginCard/>
    </div>
  );
};

export default LoginPage;
