"use client";

import { CardWrapper } from "./card-wrapper";
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
import { RegisterSchema } from "@/lib";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Register } from "@/actions/auth/signup";

export function RegisterForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      loginId: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    const toastId = toast.loading("Creating your account...");

    startTransition(() => {
      Register(values)
        .then((data: { success?: string; error?: string }) => {
          if (data.error) {
            toast.error(data.error, {
              closeButton: true,
              id: toastId,
            });
          } else {
            toast.success(data.success, {
              closeButton: true,
              id: toastId,
            });
            form.reset();
          }
        })
        .catch(() => {
          toast.error("Something went wrong!", {
            closeButton: true,
            id: toastId,
          });
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Create Account"
      headerdescription="Sign up to start managing your inventory"
      backButtonHref="/auth/login"
      backButtonLable="Already have an account?"
      isDisabled={isPending}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="loginId"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Enter Login Id
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Choose a unique Login ID (6-12 chars)"
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
            name="email"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Enter Email Id
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="your.email@example.com"
                    {...field}
                    disabled={isPending}
                    type="email"
                    className="h-11"
                    autoComplete="email"
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
                <FormLabel className="text-sm font-medium">
                  Enter Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Min 8 chars, uppercase, lowercase, digit, special"
                      {...field}
                      disabled={isPending}
                      type={isPasswordVisible ? "text" : "password"}
                      className="h-11 pr-10"
                      autoComplete="new-password"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Re-Enter Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      {...field}
                      disabled={isPending}
                      type={isConfirmVisible ? "text" : "password"}
                      className="h-11 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      className="absolute right-0 top-0 h-11 px-3 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                      type="button"
                      tabIndex={-1}
                    >
                      {isConfirmVisible ? (
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
              <UserPlus className="mr-2 size-4" />
            )}
            SIGN UP
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
