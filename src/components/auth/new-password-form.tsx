"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewPasswordSchema } from "@/lib";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { newPassword } from "@/actions/auth/new-password";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const token = searchParams.get("token");
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    const toastId = toast.loading("Updating password...");

    startTransition(() => {
      newPassword(values, token).then((data) => {
        if (data?.error) {
          toast.error(data.error, { id: toastId, closeButton: true });
        }

        if (data?.success) {
          toast.success(data.success, { id: toastId, closeButton: true });
          router.push("/auth/login");
        }
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Enter new password"
      backButtonLable="Back to login"
      backButtonHref="/auth/login"
      isDisabled={isPending}
      headerdescription="Enter your new password"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="******"
                        type={isPasswordVisible ? "text" : "password"}
                      />
                      <button
                        className="absolute bottom-0 right-0 h-10 px-3 pt-1 text-center text-gray-500"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        type="button"
                      >
                        {isPasswordVisible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Reset password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};









