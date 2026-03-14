"use client";

import { useCurrentUserClient } from "@/hook/use-current-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, User as UserIcon, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, status } = useCurrentUserClient();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.name || "User"}</CardTitle>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <UserIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Full Name</p>
              <p className="text-sm text-muted-foreground">{user?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email Address</p>
              <p className="text-sm text-muted-foreground">{user?.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Role</p>
              <Badge variant="secondary">User</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
