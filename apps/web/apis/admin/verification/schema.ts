// Mock schemas — uncomment and import zod when backend is ready
// import { z } from "zod";

// export const verificationApprovalSchema = z.object({
//   status: z.enum(["approved", "rejected"], {
//     required_error: "Please select an approval decision",
//   }),
//   reason: z
//     .string()
//     .min(10, "Reason must be at least 10 characters")
//     .optional(),
// });

// export const verificationRequestSchema = z.object({
//   documents: z.array(z.string()).min(1, "At least one document is required"),
//   message: z.string().optional(),
// });

// export const verificationInfoRequestSchema = z.object({
//   message: z
//     .string()
//     .min(10, "Message must be at least 10 characters")
//     .max(500, "Message must not exceed 500 characters"),
// });

// export type VerificationApprovalData = z.infer<typeof verificationApprovalSchema>;
// export type VerificationRequestData = z.infer<typeof verificationRequestSchema>;
// export type VerificationInfoRequestData = z.infer<typeof verificationInfoRequestSchema>;

export {};