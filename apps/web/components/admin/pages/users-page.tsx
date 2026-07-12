"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { SearchInput } from "@/components/ui/search-input";
import { Button, CustomSelect, Input, PasswordInput, useToast } from "@/components/ui";
import type { AdminEntity } from "@/apis/admin/supported-api";
import {
  PageTitle,
  LoadState,
  useAdminList,
  FilterSelect,
  EntityTable,
  Pager,
  errorMessage,
} from "../shared";

type UserForm = {
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  password: string;
};

const emptyForm: UserForm = {
  userName: "",
  fullName: "",
  email: "",
  phone: "",
  role: "CUSTOMER",
  status: "ACTIVE",
  password: "",
};

const roleOptions = [
  { value: "CUSTOMER", label: "Khách hàng" },
  { value: "PROVIDER", label: "Nhà cung cấp" },
  { value: "ADMIN", label: "Quản trị viên" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Ngừng hoạt động" },
  { value: "BANNED", label: "Bị cấm" },
];

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function buildForm(user?: AdminEntity): UserForm {
  if (!user) return emptyForm;
  return {
    userName: getString(user.userName),
    fullName: getString(user.fullName),
    email: getString(user.email),
    phone: getString(user.phone),
    role: getString(user.role) || "CUSTOMER",
    status: getString(user.status) || "ACTIVE",
    password: "",
  };
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminEntity | undefined>();
  const [deletingUser, setDeletingUser] = useState<AdminEntity | undefined>();

  const query = useAdminList("users", API_ENDPOINTS.ADMIN.USERS.LIST, {
    page,
    pageSize,
    keyword,
    role,
    status,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      (await api.post<ApiResponse<unknown>>(API_ENDPOINTS.USERS.CREATE, payload)).data.data,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-real", "users"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      (await api.put<ApiResponse<unknown>>(API_ENDPOINTS.USERS.UPDATE(id), payload)).data.data,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-real"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      (await api.delete<ApiResponse<unknown>>(API_ENDPOINTS.USERS.DELETE(id))).data.data,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-real"] }),
  });

  const openCreateForm = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (user: AdminEntity) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(undefined);
  };

  const deleteUser = (user: AdminEntity) => {
    deleteMutation.mutate(getString(user.id), {
      onSuccess: () => showToast("Đã ngừng hoạt động tài khoản.", "success"),
      onError: (error) => showToast(errorMessage(error), "error"),
      onSettled: () => setDeletingUser(undefined),
    });
  };

  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageTitle title="Quản lý người dùng" description="Tìm kiếm, lọc và quản lý tài khoản người dùng trên hệ thống." />
        <Button onClick={openCreateForm} className="w-full xl:w-auto">
          Thêm người dùng
        </Button>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput
            className="w-full xl:max-w-md"
            value={keyword}
            placeholder="Tìm theo tên, email hoặc số điện thoại"
            onChange={(value) => {
              setKeyword(value);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-52"
            value={role}
            options={[{ value: "", label: "Mọi vai trò" }, ...roleOptions]}
            onChange={(value) => {
              setRole(value);
              setPage(1);
            }}
          />
          <FilterSelect
            className="w-full sm:w-52"
            value={status}
            options={[{ value: "", label: "Mọi trạng thái" }, ...statusOptions]}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <span className="text-sm font-medium text-muted xl:ml-auto">
            {query.isFetching ? "Đang tải..." : `${query.data?.pagination.totalItems ?? 0} tài khoản`}
          </span>
        </div>
      </div>

      <EntityTable
        loading={query.isLoading}
        items={query.data?.items}
        columns={["userName", "displayName", "email", "role", "status"]}
        detailBase="/admin/users"
        actions={(user) => [
          { label: "Sửa", onClick: () => openEditForm(user) },
          { label: "Xóa", onClick: () => setDeletingUser(user), variant: "danger" },
        ]}
      />
      <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />

      <UserCrudDialog
        open={isFormOpen}
        user={editingUser}
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
        onClose={closeForm}
        onSubmit={(form) => {
          const isEdit = Boolean(editingUser);
          const payload = {
            userName: form.userName.trim(),
            fullName: form.fullName.trim() || undefined,
            email: form.email.trim(),
            phone: form.phone.trim(),
            role: form.role,
            status: form.status,
            ...(!isEdit ? { password: form.password } : {}),
          };

          if (isEdit && editingUser) {
            updateMutation.mutate(
              { id: getString(editingUser.id), payload },
              {
                onSuccess: () => {
                  closeForm();
                  showToast("Đã cập nhật người dùng.", "success");
                },
                onError: (error) => showToast(errorMessage(error), "error"),
              },
            );
            return;
          }

          createMutation.mutate(payload, {
            onSuccess: () => {
              closeForm();
              showToast("Đã thêm người dùng.", "success");
            },
            onError: (error) => showToast(errorMessage(error), "error"),
          });
        }}
      />

      <DeleteUserDialog
        user={deletingUser}
        isSubmitting={deleteMutation.isLoading}
        onClose={() => setDeletingUser(undefined)}
        onConfirm={() => deletingUser && deleteUser(deletingUser)}
      />
    </div>
  );
}

function DeleteUserDialog({
  user,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  user?: AdminEntity;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!user) return null;

  const userName = getString(user.userName) || getString(user.email) || "tài khoản này";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl border border-border-muted bg-surface p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground">Xóa người dùng</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Bạn có chắc muốn xóa/ngừng hoạt động tài khoản <span className="font-semibold text-foreground">{userName}</span>?
        </p>
        <p className="mt-3 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
          Tài khoản sẽ được chuyển sang trạng thái ngừng hoạt động.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting} className="bg-danger text-white hover:bg-danger/90">
            {isSubmitting ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserCrudDialog({
  open,
  user,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  user?: AdminEntity;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (form: UserForm) => void;
}) {
  const [form, setForm] = useState<UserForm>(() => buildForm(user));
  const [formError, setFormError] = useState("");
  const isEdit = Boolean(user);

  useEffect(() => {
    if (open) {
      setForm(buildForm(user));
      setFormError("");
    }
  }, [open, user]);

  if (!open) return null;

  const updateField = (name: keyof UserForm, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.userName.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError("Vui lòng nhập đầy đủ tên đăng nhập, email và số điện thoại.");
      return;
    }
    if (!isEdit && form.password.length < 6) {
      setFormError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setFormError("");
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-3xl border border-border-muted bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEdit ? "Sửa người dùng" : "Thêm người dùng"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {isEdit ? "Cập nhật thông tin tài khoản." : "Tạo tài khoản mới cho người dùng."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-surface-muted hover:text-foreground"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Tên đăng nhập" required>
              <Input required value={form.userName} onChange={(event) => updateField("userName", event.target.value)} placeholder="nguyenvana" />
            </FormField>
            <FormField label="Họ và tên">
              <Input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} placeholder="Nguyễn Văn A" />
            </FormField>
            <FormField label="Email" required>
              <Input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="user@example.com" />
            </FormField>
            <FormField label="Số điện thoại" required>
              <Input required value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="0901234567" />
            </FormField>
            <FormField label="Vai trò" required>
              <CustomSelect value={form.role} options={roleOptions} onValueChange={(value) => updateField("role", value)} />
            </FormField>
            <FormField label="Trạng thái" required>
              <CustomSelect value={form.status} options={statusOptions} onValueChange={(value) => updateField("status", value)} />
            </FormField>
            {!isEdit && (
              <FormField label="Mật khẩu" required className="md:col-span-2">
                <PasswordInput
                  required
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Nhập mật khẩu tối thiểu 6 ký tự"
                />
              </FormField>
            )}
          </div>

          {formError && <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{formError}</p>}

          <div className="flex justify-end gap-3 border-t border-border-subtle pt-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm người dùng"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
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
