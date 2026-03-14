import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Route } from "lucide-react";
import Link from "next/link";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  headerdescription: string;
  backButtonLable: string;
  backButtonHref: string;
  backButtonText?: string;
  isDisabled: boolean;
  showSocial?: boolean;
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export const CardWrapper = ({
  children,
  headerLabel,
  headerdescription,
  backButtonLable,
  backButtonHref,
  backButtonText,
  isDisabled,
  secondaryAction,
}: CardWrapperProps) => {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      {/* ───── Logo above the card ───── */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <Route className="size-5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          True Route
        </span>
      </div>

      {/* ───── Auth Card ───── */}
      <Card className="w-full max-w-[420px] border-border bg-card shadow-2xl">
        <CardHeader className="space-y-1 px-6 pt-0 pb-4 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {headerLabel}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {headerdescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-4">
          {children}
        </CardContent>
      </Card>

      {/* ───── Footer link ───── */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {backButtonText || backButtonLable.replace(/Sign Up|Sign up|Login|Sign In/gi, "").trim()}{" "}
        <Link
          href={backButtonHref}
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
        >
          {backButtonLable}
        </Link>
      </p>
    </section>
  );
};
