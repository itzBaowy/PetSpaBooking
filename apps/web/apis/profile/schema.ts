import { z } from "zod";

export const profileRouteRoleSchema = z.enum(["admin", "provider"]);

export const profileRoleSchema = z.enum(["ADMIN", "SERVICE_PROVIDER"]);

export const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  role: profileRoleSchema,
  title: z.string().min(1),
  department: z.string().min(1),
  timezone: z.string().min(1),
  lastLoginAt: z.string().min(1),
  joinedAt: z.string().min(1),
});

export const profileUpdateSchema = profileSchema.pick({
  name: true,
  phone: true,
  title: true,
  department: true,
  timezone: true,
});

export type ProfileRouteRole = z.infer<typeof profileRouteRoleSchema>;
export type ProfileRole = z.infer<typeof profileRoleSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
