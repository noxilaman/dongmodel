import { BadRequestException } from "@nestjs/common";
import type { z } from "zod";

export function parseZod<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: unknown
): z.output<TSchema> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new BadRequestException({
      message: "Invalid request body",
      issues: result.error.issues
    });
  }

  return result.data;
}
