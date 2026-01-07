import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string(),
  age: z.number().optional().default(18),
});

export const validateBody =
  (schema) =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.log("Zod validation issues:", result.error.issues);
      // ✅ Send readable error to client
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    // ✅ Valid + sanitized data
    req.body = result.data;
    next();
  };

