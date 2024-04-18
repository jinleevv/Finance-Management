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
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useHooks } from "@/hooks";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid Email" }),
  password: z.string().min(8, { message: "Invalid password" }),
});

export function LoginCard() {
  const navigate = useNavigate();
  const [invalidLogin, setInvalidLogin] = useState(false);
  const { clientII, setLogedInUser } = useHooks();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await clientII
        .post(
          "/api/login/",
          { email: values.email, password: values.password },
          { withCredentials: true }
        )
        .then(() => {
          navigate("/main");
          setInvalidLogin(false);
          setLogedInUser(true);
        })
        .catch(() => {
          setInvalidLogin(true);
        });
    } catch (error) {
      if (error.response.data["reason"] === "Non existing user") {
        setInvalidLogin(true);
      }
    }
  }

  return (
    <Card className="lg:w-[500px] sm:w-full sm:h-svh m-auto lg:mt-36 sm:mt-0">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Ulitum CAM finance management account</CardDescription>
        {invalidLogin && (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Email and password does not match or not in the system! <br />
              Please try again
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-3">
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
                          placeholder="Finance Management Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* <div className="mt-2 mb-3 text-sm text-right">
              Don't have an account?{" "}
              <a href="/signup" className="underline">
                Sign Up
              </a>
            </div> */}
            <div className="mt-3 flex justify-between">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
