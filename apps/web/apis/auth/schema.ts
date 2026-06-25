import { z } from "zod";

export const loginSchema = z.object({
  userName: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerProviderSchema = z
  .object({
    userName: z.string().min(1, "Tên đăng nhập là bắt buộc"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().min(1, "Số điện thoại là bắt buộc"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterProviderData = z.infer<typeof registerProviderSchema>;
