import { useSession } from "next-auth/react";

type User = {
  name: string;
  email: string;
  image: string | null;
  id: string;
};

export function useCurrentUserClient(): {
  user: User | null | undefined;
  status: "loading" | "authenticated" | "unauthenticated";
} {
  const session = useSession();
  // @ts-expect-error — next-auth session type doesn't include custom fields by default
  return { user: session.data?.user ?? null, status: session.status };
}
