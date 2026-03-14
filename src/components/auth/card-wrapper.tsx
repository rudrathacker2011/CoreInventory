import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../ui/card";
import { BackButton } from "./BackButton";
import { Boxes } from "lucide-react";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLable: string;
  backButtonHref: string;
  headerdescription: string;
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
  isDisabled,
  secondaryAction,
}: CardWrapperProps) => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="w-full max-w-[420px]">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2 pt-8">
            {/* App Logo */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
                <Boxes className="size-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{headerLabel}</h1>
            <p className="text-sm text-muted-foreground mt-1">{headerdescription}</p>
          </CardHeader>
          <CardContent className="px-6 pb-4">{children}</CardContent>
          <CardFooter className="flex-col gap-1 px-6 pb-6">
            <div className="flex items-center gap-1 text-sm">
              {secondaryAction && (
                <>
                  <BackButton href={secondaryAction.href} lable={secondaryAction.label} />
                  <span className="text-muted-foreground">|</span>
                </>
              )}
              <BackButton href={backButtonHref} lable={backButtonLable} />
            </div>
          </CardFooter>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">
          CoreInventory &copy; {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
};
