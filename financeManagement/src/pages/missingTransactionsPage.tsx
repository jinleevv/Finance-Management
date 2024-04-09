import ViewMissingTransactions from "@/feature/MissingTransactions";
import Navbar from "@/feature/Navbar";

const MissingTransactionsPage = () => {
  return (
    <div className="w-full h-full m-auto">
      <Navbar />
      <ViewMissingTransactions />
    </div>
  );
};

export default MissingTransactionsPage;
