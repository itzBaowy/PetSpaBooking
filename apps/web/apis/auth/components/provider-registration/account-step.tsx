import type { ChangeEvent } from "react";
import { Input, PasswordInput, Textarea } from "@/components/ui";
import type { ProviderRegistrationFormState } from "../../hooks/use-provider-registration-draft";
import { ProviderRegistrationField } from "./field";

export function ProviderRegistrationAccountStep({
  form,
  onInputChange,
}: {
  form: ProviderRegistrationFormState;
  hasExistingAccount?: boolean;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}) {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <ProviderRegistrationField label="Tên đăng nhập" required>
        <Input
          required
          name="userName"
          value={form.userName}
          onChange={onInputChange}
          placeholder="petlink_provider"
        />
      </ProviderRegistrationField>
      <ProviderRegistrationField label="Tên doanh nghiệp" required>
        <Input
          required
          name="businessName"
          value={form.businessName}
          onChange={onInputChange}
          placeholder="VD: Paws & Whiskers Spa"
        />
      </ProviderRegistrationField>
      <ProviderRegistrationField label="Email doanh nghiệp" required>
        <Input
          required
          type="email"
          name="email"
          value={form.email}
          onChange={onInputChange}
          placeholder="business@example.com"
        />
      </ProviderRegistrationField>
      <ProviderRegistrationField label="Số điện thoại" required>
        <Input
          required
          name="phone"
          value={form.phone}
          onChange={onInputChange}
          placeholder="0901 234 567"
        />
      </ProviderRegistrationField>
      <ProviderRegistrationField label="Mật khẩu" required>
        <PasswordInput
          required
          name="password"
          value={form.password}
          onChange={onInputChange}
          placeholder="Tối thiểu 6 ký tự"
        />
      </ProviderRegistrationField>
      <ProviderRegistrationField label="Xác nhận mật khẩu" required>
        <PasswordInput
          required
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={onInputChange}
          placeholder="Nhập lại mật khẩu"
        />
      </ProviderRegistrationField>
      <ProviderRegistrationField
        label="Địa chỉ doanh nghiệp"
        required
        className="md:col-span-2"
      >
        <Input
          required
          name="address"
          value={form.address}
          onChange={onInputChange}
          placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
        />
      </ProviderRegistrationField>
      <ProviderRegistrationField
        label="Mô tả doanh nghiệp"
        className="md:col-span-2"
      >
        <Textarea
          name="description"
          value={form.description}
          onChange={onInputChange}
          placeholder="Mô tả cơ sở và dịch vụ nổi bật..."
        />
      </ProviderRegistrationField>
    </section>
  );
}
