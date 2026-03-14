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
import { Loader2 } from "lucide-react";
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
      headerLabel="Forgot your password?"
      headerdescription="Enter your email and we'll send you a reset link"
      backButtonLable="Back to login"
      backButtonHref="/auth/login"
      isDisabled={isPending}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="m@example.com"
                    type="email"
                    className="h-10 bg-transparent border-border text-foreground placeholder:text-muted-foreground"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-10 text-sm font-semibold"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
