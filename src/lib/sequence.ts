import { db } from "./db";

/**
 * Generates the next reference number for a given prefix.
 * e.g. prefix "WH/IN" → "WH/IN/0001", "WH/IN/0002", etc.
 */
export async function getNextReference(prefix: string): Promise<string> {
  const sequence = await db.sequence.upsert({
    where: { prefix },
    update: { counter: { increment: 1 } },
    create: { prefix, counter: 1 },
  });

  const paddedCounter = String(sequence.counter).padStart(4, "0");
  return `${prefix}/${paddedCounter}`;
}
