import { OperationStatus } from "@prisma/client";

export type StatusVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export function getStatusBadgeVariant(
  status: OperationStatus
): StatusVariant {
  switch (status) {
    case "DONE":
      return "default";
    case "READY":
      return "secondary";
    case "WAITING":
      return "outline";
    case "DRAFT":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

export function getStatusLabel(status: OperationStatus): string {
  switch (status) {
    case "DONE":
      return "Done";
    case "READY":
      return "Ready";
    case "WAITING":
      return "Waiting";
    case "DRAFT":
      return "Draft";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isLate(scheduleDate: Date | string): boolean {
  return new Date(scheduleDate) < new Date();
}
