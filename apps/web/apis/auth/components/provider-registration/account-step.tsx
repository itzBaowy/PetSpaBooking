import type { ChangeEvent } from "react";
import { Input, PasswordInput, Textarea } from "@/components/ui";
import type { ProviderRegistrationFormState } from "../../hooks/use-provider-registration-draft";
import { ProviderRegistrationField } from "./field";
import { ProviderRegistrationAddressField } from "./provider-address-field";

export function ProviderRegistrationAccountStep({
  form,
  onInputChange,
  onFieldChange,
}: {
  form: ProviderRegistrationFormState;
  hasExistingAccount?: boolean;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onFieldChange: (
    name: keyof ProviderRegistrationFormState,
    value: ProviderRegistrationFormState[keyof ProviderRegistrationFormState],
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
      <ProviderRegistrationAddressField
        form={form}
        onFieldChange={onFieldChange}
      />
      <ProviderRegistrationField
        label="Mô tả doanh nghiệp"
        className="order-2 md:col-span-2"
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
