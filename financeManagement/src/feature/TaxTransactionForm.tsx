import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { useHooks } from "@/hooks";
import { useEffect } from "react";

const formSchema = z.object({
  date: z.date({
    required_error: "It is required",
  }),
  category: z.string().min(1, { message: "It is required" }),
  billing_amount: z.string().min(1, { message: "It is required" }),
  tps: z.string().min(1, { message: "It is required" }),
  tvq: z.string().min(1, { message: "It is required" }),
  merchant_name: z.string().min(1, { message: "It is required" }),
  purpose: z.string().min(1, { message: "It is required" }),
  project: z.string().min(1, { message: "It is required" }),
  attendees: z.string().min(1, { message: "It is required" }),
  file: z
    .instanceof(FileList)
    .refine((file) => file?.length == 1, "File is required."),
});

const TaxTransactionForm = () => {
  const nativate = useNavigate();
  const { clientI, userName } = useHooks();
  const today = new Date();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const billingAmount = parseFloat(form.getValues().billing_amount);
    if (!isNaN(billingAmount)) {
      const tvqValue = (billingAmount * 0.09975).toFixed(3).toString();
      const tpsValue = (billingAmount * 0.05).toFixed(3).toString();
      form.setValue("tvq", tvqValue);
      form.setValue("tps", tpsValue);
    }
  }, [form.watch("billing_amount")]);

  const fileRef = form.register("file");

  function handleCancel() {
    nativate("/main");
  }

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const filename =
        values.date.toISOString().split("T")[0] +
        "__" +
        values.billing_amount +
        "__" +
        values.merchant_name +
        ".png";
      const name = userName.split(" ");
      const firstName = name.slice(0, -1).join(" ");
      const lastName = name[name.length - 1];

      let data = new FormData();
      data.append("date", values.date.toISOString().split("T")[0]);
      data.append("file", values.file[0], filename);
      data.append("billing_amount", values.billing_amount);
      data.append("tps", values.tps);
      data.append("tvq", values.tvq);
      data.append("merchant_name", values.merchant_name);
      data.append("purpose", values.purpose);
      data.append("first_name", firstName);
      data.append("last_name", lastName);
      data.append("category", values.category);
      data.append("attendees", values.attendees);
      data.append("project", values.project);

      await clientI
        .post("/api/card-transaction-upload/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          form.reset({
            category: "",
            billing_amount: "",
            tps: "",
            tvq: "",
            merchant_name: "",
            purpose: "",
            project: "",
            attendees: "",
            file: null,
          });

          toast("Transaction history has been Updated", {
            description: today.toISOString(),
          });
        })
        .catch(() => toast.error("Updating the transaction history failed"));
    } catch (error) {
      toast("Updating the transaction history failed");
    }
  }

  return (
    <Card className="w-[800px] sm:w-full xsm:w-full m-auto mt-20 sm:mt-0 xsm:mt-0 opacity-90 sm:opacity-85">
      <CardHeader>
        <div className="flex justify-between gap-4">
          <CardTitle>Corporate Card Transaction Form</CardTitle>
          <Button variant="outline" onClick={handleCancel} size="sm">
            <ArrowLeftIcon />
          </Button>
        </div>
        <CardDescription>
          Corporate Card Transaction Information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-3">
                <Label htmlFor="image_file">Image File</Label>
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                      <FormControl>
                        <Input
                          className="w-full sm:w-full xsm:w-full"
                          id="file"
                          type="file"
                          {...fileRef}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-20 sm:gap-3 xsm:gap-3">
                  <div className="grid space-y-3">
                    <Label htmlFor="date">Date</Label>
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                          <FormControl>
                            <Popover {...field}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[280px] sm:w-[180px] xsm:w-[150px] justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-full grid space-y-3">
                    <Label htmlFor="category">Category</Label>
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                          <FormControl>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                className="w-full h-full xsm:w-full overflow-hidden"
                              >
                                <Button variant="outline">
                                  {field.value ? (
                                    field.value
                                  ) : (
                                    <span>Choose a category</span>
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-full h-full break-all">
                                <DropdownMenuLabel>
                                  Choose a category
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <DropdownMenuRadioItem value="Business Trip(Hotel,Food,Gas,Parking,Toll,Trasportation)">
                                    Business Trip
                                    (Hotel,Food,Gas,Parking,Toll,Trasportation)
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="Meeting with Business Partners">
                                    Meeting with Business Partners
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="Meeting between employees">
                                    Meeting between employees
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="Business Conference, Seminar, Workshop">
                                    Business Conference, Seminar, Workshop
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="Banking Fees">
                                    Banking Fees
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="Others(Ask Finance Department)">
                                    Others (Ask Finance Department)
                                  </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex gap-20 sm:gap-3 xsm:gap-3">
                  <div className="grid space-y-3">
                    <Label htmlFor="amount">Billing Amount</Label>
                    <FormField
                      control={form.control}
                      name="billing_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                          <FormControl>
                            <Input
                              id="amount"
                              placeholder="Amount"
                              className="w-[280px] sm:w-[180px] xsm:w-[150px]"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex w-full gap-3 sm:gap-1 xsm:gap-1">
                      <div className="grid space-y-3">
                        <Label htmlFor="amount">TPS (GST)</Label>
                        <FormField
                          control={form.control}
                          name="tps"
                          render={({ field }) => (
                            <FormItem>
                              <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                              <FormControl>
                                <Input
                                  id="amount"
                                  placeholder="Amount"
                                  className="w-[190px] sm:w-full xsm:w-full"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid space-y-3">
                        <Label htmlFor="amount">TVQ (QST)</Label>
                        <FormField
                          control={form.control}
                          name="tvq"
                          render={({ field }) => (
                            <FormItem>
                              <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                              <FormControl>
                                <Input
                                  id="amount"
                                  placeholder="Amount"
                                  className="w-[190px] sm:w-full xsm:w-full"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-20 sm:gap-3 xsm:gap-3">
                  <div className="grid space-y-3">
                    <Label htmlFor="merchant_name">Merchant Name</Label>
                    <FormField
                      control={form.control}
                      name="merchant_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                          <FormControl>
                            <Input
                              id="merchant_name"
                              placeholder="Merchant Name"
                              className="w-[280px] sm:w-[180px] xsm:w-[150px]"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-full grid space-y-3">
                    <Label htmlFor="project">Project</Label>
                    <FormField
                      control={form.control}
                      name="project"
                      render={({ field }) => (
                        <FormItem>
                          <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                          <FormControl>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                className="w-full h-full xsm:w-full overflow-hidden"
                              >
                                <Button variant="outline">
                                  {field.value ? (
                                    field.value
                                  ) : (
                                    <span>Choose a project</span>
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-full h-full break-all">
                                <DropdownMenuLabel>
                                  Choose a project
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  className="w-[400px] text-center"
                                >
                                  <DropdownMenuRadioItem value="CAM1">
                                    CAM1
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="CAM2">
                                    CAM2
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="PCAM">
                                    PCAM
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="N/A">
                                    N/A
                                  </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex gap-20 sm:gap-3 xsm:gap-3">
                  <div className="grid space-y-3">
                    <Label htmlFor="purpose">Purpose of Payment</Label>
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide the specific purpose of payment"
                              className="w-[280px] sm:w-[180px] xsm:w-full"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid space-y-3">
                    <Label htmlFor="attendees">Attendees</Label>
                    <FormField
                      control={form.control}
                      name="attendees"
                      render={({ field }) => (
                        <FormItem>
                          <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                          <FormControl>
                            <Textarea
                              placeholder="Attendees"
                              className="w-[386px] sm:w-full xsm:w-full"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Submit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Corporate Card Transaction Form</DialogTitle>
                    <DialogDescription>
                      Submit the transaction form
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Alert variant="destructive">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <AlertTitle>Please review before submitting</AlertTitle>
                      <AlertDescription>
                        If you submit, you cannot undo the change!
                      </AlertDescription>
                    </Alert>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button onClick={() => form.handleSubmit(onSubmit)()}>
                        Continue
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </Form>
        <Toaster />
      </CardContent>
    </Card>
  );
};

export default TaxTransactionForm;
