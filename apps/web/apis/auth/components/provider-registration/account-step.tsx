import type { ChangeEvent } from "react";
import { Input, PasswordInput, Textarea } from "@/components/ui";
import { ProviderLocationMap } from "@/apis/provider/business-profile/components/provider-location-map";
import type { ProviderRegistrationFormState } from "../../hooks/use-provider-registration-draft";
import { ProviderRegistrationField } from "./field";

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
  const latValue = parseCoordinate(form.lat);
  const lngValue = parseCoordinate(form.lng);

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
      <ProviderRegistrationField
        label="Vị trí trên bản đồ"
        required
        className="md:col-span-2"
      >
        <div className="space-y-3">
          <ProviderLocationMap
            lat={latValue}
            lng={lngValue}
            onChange={(location) => {
              onFieldChange("lat", String(location.lat));
              onFieldChange("lng", String(location.lng));
            }}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input readOnly value={form.lat} placeholder="Vĩ độ" />
            <Input readOnly value={form.lng} placeholder="Kinh độ" />
          </div>
        </div>
      </ProviderRegistrationField>
    </section>
  );
}

function parseCoordinate(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
