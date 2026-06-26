import { roleLabels, statusLabels, type AdminUser, type AdminUserRole, type AdminUserStatus } from "./schema";

export const roleFilterOptions: Array<{ label: string; value: "" | AdminUserRole }> = [
  { label: "Tất cả vai trò", value: "" },
  { label: roleLabels.CUSTOMER, value: "CUSTOMER" },
  { label: roleLabels.PROVIDER, value: "PROVIDER" },
  { label: roleLabels.ADMIN, value: "ADMIN" },
];

export const statusFilterOptions: Array<{ label: string; value: "" | AdminUserStatus }> = [
  { label: "Tất cả trạng thái", value: "" },
  { label: statusLabels.ACTIVE, value: "ACTIVE" },
  { label: statusLabels.INACTIVE, value: "INACTIVE" },
  { label: statusLabels.BANNED, value: "BANNED" },
];

export const roleSelectOptions = Object.entries(roleLabels).map(([value, label]) => ({
  value,
  label,
}));

export const statusSelectOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

export function getUserDisplayName(user: AdminUser) {
  return user.fullName || user.userName;
}

export function getUserInitial(user: AdminUser) {
  return getUserDisplayName(user).charAt(0).toUpperCase();
}

export function getDeactivateConfirmMessage(user: AdminUser) {
  return `Bạn có chắc muốn chuyển ${user.userName} sang trạng thái ngừng hoạt động?`;
}

export function getRoleChangeConfirmMessage(user: AdminUser, role: AdminUserRole) {
  return `Đổi vai trò của ${user.userName} thành ${roleLabels[role]}?`;
}
