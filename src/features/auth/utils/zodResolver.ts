import type { FieldErrors, Resolver } from "react-hook-form";
import { z } from "zod";

export const createZodResolver = <TSchema extends z.ZodTypeAny>(
  schema: TSchema
): Resolver<z.infer<TSchema>> => {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const formErrors = result.error.issues.reduce<FieldErrors<z.infer<TSchema>>>(
      (acc, issue) => {
        const path = issue.path.join(".");
        (acc as Record<string, any>)[path] = {
          type: issue.code,
          message: issue.message,
        };
        return acc;
      },
      {} as FieldErrors<z.infer<TSchema>>
    );

    return {
      values: {} as z.infer<TSchema>,
      errors: formErrors,
    };
  };
};
