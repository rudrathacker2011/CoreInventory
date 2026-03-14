"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetSchema } from "@/lib";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { CardWrapper } from "./card-wrapper";
import { Button } from "../ui/button";
import { Loader2, Mail } from "lucide-react";
import { reset } from "@/actions/auth/reset";
import { toast } from "sonner";

export const ResetForm = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    const toastId = toast.loading("Sending reset email...");
    startTransition(() => {
      reset(values).then((data) => {
        if (data?.error) {
          toast.error(data.error, { id: toastId, closeButton: true });
        }

        if (data?.success) {
          toast.success(data.success, { id: toastId, closeButton: true });
          form.reset();
        }
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Forgot Password?"
      headerdescription="Enter your email to receive a password reset link"
      backButtonLable="Back to Login"
      backButtonHref="/auth/login"
      isDisabled={isPending}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="your.email@example.com"
                    type="email"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-11 text-base font-semibold"
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Mail className="mr-2 size-4" />
            )}
            Send Reset Email
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
