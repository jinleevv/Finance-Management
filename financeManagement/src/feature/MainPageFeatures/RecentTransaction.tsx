// import { Terminal } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Label } from "@/components/ui/label";
// import { useHooks } from "@/hooks";

// export function RecentTransaction() {
//   const { recentData } = useHooks();
//   return (
//     <Alert>
//       <Terminal className="h-4 w-4" />
//       <AlertTitle className="mb-5">Most Recent Transaction</AlertTitle>
//       <AlertDescription className="w-full">
//         <div className="flex lg:gap-32 sm:gap-5 overflow-auto">
//           <div className="w-1/3 grid space-y-3">
//             <Label className="w-full">
//               Transaction Date: {recentData["trans_date"]}
//             </Label>
//             <Label>Merchant Name: {recentData["merchant_name"]}</Label>
//             <Label>Billing Amount: {recentData["billing_amount"]}</Label>
//           </div>
//           <div className="border"></div>
//           <div className="w-full grid space-y-3">
//             <Label>Category: {recentData["category"]}</Label>
//             <Label>Purpose: {recentData["purpose"]}</Label>
//             <Label>Attendees: {recentData["attendees"]}</Label>
//           </div>
//         </div>
//       </AlertDescription>
//     </Alert>
//   );
// }
