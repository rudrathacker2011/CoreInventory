"use client";

import { CardWrapper } from "./card-wrapper";
import { Signin } from "@/actions/auth/login";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SigninSchema } from "@/lib";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const searchparams = useSearchParams();
  const callbackUrl = searchparams.get("callbackUrl");
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      loginId: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SigninSchema>) => {
    const toastId = toast.loading("Signing in...");

    startTransition(async () => {
      try {
        const data = await Signin(values, callbackUrl);

        if (data?.error) {
          toast.error(data.error, { id: toastId, closeButton: true });
          return;
        }

        await signIn("credentials", {
          loginId: values.loginId,
          password: values.password,
          redirect: false,
        });

        toast.success("Signed in successfully!", {
          id: toastId,
          closeButton: true,
        });

        router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT);
      } catch (err: any) {
        toast.error("Invalid Login Id or Password", {
          id: toastId,
          closeButton: true,
        });
      }
    });
  };

  return (
    <CardWrapper
      headerLabel="Welcome Back"
      headerdescription="Sign in to your CoreInventory account"
      backButtonHref="/auth/signup"
      backButtonLable="Sign Up"
      isDisabled={isPending}
      secondaryAction={{
        label: "Forgot Password?",
        href: "/auth/reset",
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="loginId"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Login Id</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your Login ID"
                    {...field}
                    disabled={isPending}
                    className="h-11"
                    autoComplete="username"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter your Password"
                      {...field}
                      disabled={isPending}
                      type={isPasswordVisible ? "text" : "password"}
                      className="h-11 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      className="absolute right-0 top-0 h-11 px-3 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      type="button"
                      tabIndex={-1}
                    >
                      {isPasswordVisible ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-11 text-base font-semibold mt-2"
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 size-4" />
            )}
            SIGN IN
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
