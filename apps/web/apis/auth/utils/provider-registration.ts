import { getErrorMessage } from "@/lib/error";
import type { ProviderRegistrationFormState } from "../hooks/use-provider-registration-draft";

export function getProviderRegistrationErrorMessage(error: unknown): string {
  return getErrorMessage(error, "Thao tác thất bại.");
}

export function validateProviderRegistrationStep(
  form: ProviderRegistrationFormState,
  targetStep: number,
): string | null {
  if (targetStep === 1) {
    if (!form.userName.trim()) return "Vui lòng nhập tên đăng nhập.";
    if (!form.businessName.trim()) return "Vui lòng nhập tên doanh nghiệp.";
    if (!form.email.trim()) return "Vui lòng nhập email doanh nghiệp.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      return "Email doanh nghiệp không hợp lệ (ví dụ: example@gmail.com).";
    }
    if (!form.phone.trim()) return "Vui lòng nhập số điện thoại.";
    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      return "Số điện thoại không hợp lệ (chỉ chứa 9-11 chữ số).";
    }
    if (!form.password || form.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (form.password !== form.confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }
    if (!form.address.trim()) return "Vui lòng nhập địa chỉ doanh nghiệp.";
  }

  if (targetStep === 2) {
    if (!form.idCardFront) return "Vui lòng tải CCCD mặt trước.";
    if (!form.idCardBack) return "Vui lòng tải CCCD mặt sau.";
    if (!form.identityNumber.trim()) return "Vui lòng nhập số CCCD.";
    if (!form.identityFullName.trim()) return "Vui lòng nhập họ tên trên CCCD.";
    if (!form.businessLicense) return "Vui lòng tải giấy đăng ký kinh doanh.";
    if (!form.taxCode.trim()) return "Vui lòng nhập mã số thuế.";
    if (form.businessImages.length === 0) {
      return "Vui lòng tải ít nhất 1 ảnh doanh nghiệp.";
    }
    if (!form.bankCode) return "Vui lòng chọn ngân hàng.";
    if (!form.bankAccountNumber.trim()) {
      return "Vui lòng nhập số tài khoản.";
    }
    if (!form.bankAccountName.trim()) {
      return "Vui lòng nhập tên chủ tài khoản.";
    }
  }

  return null;
}

export function getProviderRegistrationReviewItems(
  form: ProviderRegistrationFormState,
) {
  return [
    ["Tên đăng nhập", form.userName],
    ["Tên doanh nghiệp", form.businessName],
    ["Email doanh nghiệp", form.email],
    ["Số điện thoại", form.phone],
    ["Địa chỉ", form.address],
    ["Ngân hàng", form.bankCode],
    ["Số tài khoản", form.bankAccountNumber],
    ["Chủ tài khoản", form.bankAccountName],
    ["Số CCCD", form.identityNumber],
    ["Họ tên trên CCCD", form.identityFullName],
    ["Ngày sinh", form.identityDob],
    ["Địa chỉ trên CCCD", form.identityAddress],
    ["Mã số thuế", form.taxCode],
  ];
}
