import { DownloadTransaction } from "@/feature/DownloadTransaction";
import Navbar from "@/feature/Navbar";

const TaxTransDownloadPage = () => {
  return (
    <div className="w-full h-full">
      <Navbar />
      <DownloadTransaction />
    </div>
  );
};

export default TaxTransDownloadPage;
