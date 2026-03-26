import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "DATABASE_URL is not set. Database access is disabled until it is provided.",
  );
}

const createPrismaClient = () => new PrismaClient();

const prismaClient = databaseUrl
  ? process.env.NODE_ENV === "production"
    ? createPrismaClient()
    : (global.prisma ??= createPrismaClient())
  : null;

export const db =
  prismaClient ||
  (new Proxy({} as PrismaClient, {
    get() {
      throw new Error(
        "DATABASE_URL is not set. Add it to your environment to enable Prisma.",
      );
    },
  }) as PrismaClient);
