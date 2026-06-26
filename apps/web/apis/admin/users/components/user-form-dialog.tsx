"use client";

import { Button, CustomSelect, Input } from "@/components/ui";
import { useAdminUserForm } from "../hooks/use-admin-user-form";
import type { AdminUser } from "../schema";
import { roleSelectOptions, statusSelectOptions } from "../user-helpers";

export function UserFormDialog({
  open,
  user,
  onClose,
}: {
  open: boolean;
  user?: AdminUser;
  onClose: () => void;
}) {
  if (!open) return null;

  return <UserFormDialogContent user={user} onClose={onClose} />;
}

function UserFormDialogContent({
  user,
  onClose,
}: {
  user?: AdminUser;
  onClose: () => void;
}) {
  const formState = useAdminUserForm({ user, onSuccess: onClose });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl border border-border-subtle bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {formState.isEdit ? "Cập nhật người dùng" : "Thêm người dùng"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Admin tạo người dùng không cần nhập mật khẩu; BE sẽ tự sinh mật
              khẩu tạm thời.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-surface-muted hover:text-foreground"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={formState.submit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tên đăng nhập" required>
              <Input
                required
                value={formState.form.userName}
                onChange={(event) =>
                  formState.updateField("userName", event.target.value)
                }
                placeholder="nguyenvana"
              />
            </Field>
            <Field label="Họ tên">
              <Input
                value={formState.form.fullName ?? ""}
                onChange={(event) =>
                  formState.updateField("fullName", event.target.value)
                }
                placeholder="Nguyễn Văn A"
              />
            </Field>
            <Field label="Email" required>
              <Input
                required
                type="email"
                value={formState.form.email}
                onChange={(event) =>
                  formState.updateField("email", event.target.value)
                }
                placeholder="user@example.com"
              />
            </Field>
            <Field label="Số điện thoại" required>
              <Input
                required
                value={formState.form.phone}
                onChange={(event) =>
                  formState.updateField("phone", event.target.value)
                }
                placeholder="0901234567"
              />
            </Field>
            <Field label="Vai trò" required>
              <CustomSelect
                value={formState.form.role}
                options={roleSelectOptions}
                onValueChange={(value) => formState.updateField("role", value)}
              />
            </Field>
            <Field label="Trạng thái" required>
              <CustomSelect
                value={formState.form.status}
                options={statusSelectOptions}
                onValueChange={(value) =>
                  formState.updateField("status", value)
                }
              />
            </Field>
            <Field label="Avatar URL" className="md:col-span-2">
              <Input
                value={formState.form.avatar ?? ""}
                onChange={(event) =>
                  formState.updateField("avatar", event.target.value)
                }
                placeholder="https://..."
              />
            </Field>
          </div>

          {formState.error && (
            <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
              {formState.error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-border-subtle pt-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting
                ? "Đang lưu..."
                : formState.isEdit
                  ? "Lưu thay đổi"
                  : "Thêm người dùng"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block space-y-1.5 text-sm font-semibold ${className ?? ""}`}>
      <span>
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}
