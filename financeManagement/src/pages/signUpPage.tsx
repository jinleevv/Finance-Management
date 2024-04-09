import { SignUpCardForm } from "@/feature/SignUpCard";
import Navbar from "@/feature/Navbar";

const SignUpPage = () => {
  return (
    <div className="w-full h-full m-auto">
      <Navbar />
      <SignUpCardForm />
    </div>
  );
};

export default SignUpPage;
