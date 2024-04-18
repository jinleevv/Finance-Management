import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useHooks } from "@/hooks";

const formSchema = z.object({
  first_name: z.string().min(2).max(50, {
    message: "The length of name should be in between 2 to 50 characters",
  }),
  last_name: z.string().min(2).max(50, {
    message: "The length of name should be in between 2 to 50 characters",
  }),
  department: z.string(),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Invalid password" }),
  confirm_password: z.string().min(8, { message: "Invalid password" }),
});

export function SignUpCardForm() {
  const navigate = useNavigate();
  const { clientII } = useHooks();
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [failedUserCreation, setFailedUserCreation] = useState(false);

  function handleCancel() {
    navigate("/");
  }

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.password !== values.confirm_password) {
      setInvalidPassword(true);
    } else {
      try {
        const data = JSON.stringify({
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          department: values.department,
          password: values.password,
        });

        await clientII
          .post("/api/register/", data, {
            headers: { "Content-Type": "application/json" },
          })
          .then(() => {
            setFailedUserCreation(false);
            navigate("/login");
          })
          .catch(() => {
            setFailedUserCreation(true);
          });
      } catch (error) {
        setFailedUserCreation(true);
      }
    }
  }

  return (
    <Card className="lg:w-[500px] sm:w-full sm:h-svh m-auto lg:mt-24 sm:mt-0">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create Ulitum CAM finance management account
        </CardDescription>
        {invalidPassword && (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Password does not match! Please enter it again
            </AlertDescription>
          </Alert>
        )}
        {failedUserCreation && (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              Failed to create a user! Please contact IT administrator
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between gap-3">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            id="first_name"
                            placeholder="First Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            id="last_name"
                            placeholder="Last Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild className="w-full">
                              <Button variant="outline">
                                {field.value ? (
                                  field.value
                                ) : (
                                  <span>Department</span>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                              <DropdownMenuLabel>Department</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuRadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="w-full"
                              >
                                <DropdownMenuRadioItem value="Procurement">
                                  Procurement
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Contruction Operation">
                                  Contruction Operation
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="President">
                                  President
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="IT Security">
                                  IT Security
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Finance">
                                  Finance
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="HR General Affairs">
                                  HR General Affairs
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Marketing">
                                  Marketing
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ultium CAM Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Ultium CAM Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Confirm Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
