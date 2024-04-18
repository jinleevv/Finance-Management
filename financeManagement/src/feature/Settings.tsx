import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";
import { useHooks } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const FormSchema = z.object({
  oldPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export function Settings() {
  const navigate = useNavigate();
  const { clientI, userName, userEmail } = useHooks();
  const today = new Date();

  function handleMain() {
    navigate("/main");
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    const data = JSON.stringify({
      email: userEmail,
      old_password: values.oldPassword,
      new_password: values.newPassword,
    });

    await clientI
      .post("/api/update-password/", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        form.reset({
          oldPassword: "",
          newPassword: "",
        });
        toast("Password has been updated, please login again", {
          description: today.toISOString(),
        });
      })
      .catch((err) => {
        if (err.response["data"]["reason"] === "Non existing user") {
          toast(`Password update failed: Current password is wrong}`, {
            description: today.toISOString(),
          });
        } else if (err.response["data"]["new_password"]) {
          toast(
            `Password update failed: ${err.response["data"]["new_password"]}`,
            {
              description: today.toISOString(),
            }
          );
        } else {
          toast(`Password update failed`, {
            description: today.toISOString(),
          });
        }
      });
  }

  return (
    <Card className="sm:w-full h-full lg:m-10 sm:m-0 z-10 p-5 sm:overflow-y-auto">
      <CardHeader>
        <CardTitle>User Settings</CardTitle>
        <CardDescription>User Information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="lg:flex sm:block gap-20 sm:space-y-3">
          <div className="grid space-y-3">
            <Tabs defaultValue="account" className="lg:w-[400px] sm:w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                      Make changes to your account here. Click save when you're
                      done.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="name">Name </Label>
                      <Input disabled id="username" defaultValue={userName} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        disabled
                        id="user_email"
                        defaultValue={userEmail}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled>Save changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="password">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>
                          Change your password here.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <FormField
                          control={form.control}
                          name="oldPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current password</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Current password"
                                  type="password"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem className="mt-3">
                              <FormLabel>New password</FormLabel>
                              <FormMessage className="-mt-2 text-[13.5px]"></FormMessage>
                              <FormControl>
                                <Input
                                  placeholder="New password"
                                  type="password"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        <Toaster />
                        <Button type="submit">Update password</Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
          <div className="grid space-y-3 w-full">
            <Alert className="lg:-ml-2">
              <RocketIcon className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                Please contact IT & Security Department if you have other
                inquires
              </AlertDescription>
            </Alert>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  Is Korean or French supported?
                </AccordionTrigger>
                <AccordionContent>
                  No, currently we do not support languages such as Korean or
                  French. However, we are in process of adding the feature.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Uploaded wrong documentation or information
                </AccordionTrigger>
                <AccordionContent>
                  In this case, please contact IT & Security department as soon
                  as possible to troubleshoot the problem.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  How to update my name or email
                </AccordionTrigger>
                <AccordionContent>
                  We currently do not support users to modify their name nor
                  email. If you would like to modify them, please contact IT &
                  Security Department.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>I forgot my password</AccordionTrigger>
                <AccordionContent>
                  If you forgot your password, please contact IT & Security
                  Department to reset your password.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Feedbacks?</AccordionTrigger>
                <AccordionContent>
                  We would love to get some feedbacks! Feel free to contact IT &
                  Security Department for any other requests or feedbacks!
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleMain}>
          Main Menu
        </Button>
        <Button>Happy</Button>
      </CardFooter>
    </Card>
  );
}
