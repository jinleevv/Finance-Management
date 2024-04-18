import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  return (
    <Accordion type="single" collapsible className="w-full p-6">
      <Label className="text-xl font-bold">FAQ</Label>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          What should I do if I uploaded incorrect transaction ?
        </AccordionTrigger>
        <AccordionContent>
          You would have to go to 'View Uploaded Transactions' and delete the
          incorrect transaction. If you deleted the transaction successfully,
          re-upload the transaction with correct information.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          I forgot my password, what should I do ?
        </AccordionTrigger>
        <AccordionContent>
          Please contect IT & Security department to reset your password
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Feedbacks</AccordionTrigger>
        <AccordionContent>
          Please contect IT & Security department for any feedback!
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
