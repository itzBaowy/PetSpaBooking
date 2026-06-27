import type { ChangeEvent } from "react";
import { CustomSelect, Input } from "@/components/ui";
import type { ProviderRegistrationFormState } from "../../hooks/use-provider-registration-draft";
import { ProviderRegistrationField } from "./field";
import { ProviderRegistrationUploadBox } from "./upload-box";

type SelectOption = {
  label: string;
  value: string;
};

export function ProviderRegistrationVerificationStep({
  form,
  bankOptions,
  identityOcrStatus,
  onInputChange,
  onFileChange,
  onFieldChange,
}: {
  form: ProviderRegistrationFormState;
  bankOptions: SelectOption[];
  identityOcrStatus?: string;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onFileChange: (
    event: ChangeEvent<HTMLInputElement>,
    name: keyof ProviderRegistrationFormState,
  ) => void;
  onFieldChange: (
    name: keyof ProviderRegistrationFormState,
    value: ProviderRegistrationFormState[keyof ProviderRegistrationFormState],
  ) => void;
}) {
  return (
    <section className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        <ProviderRegistrationField label="CCCD/CMND mặt trước" required>
          <ProviderRegistrationUploadBox
            fileName={form.idCardFront}
            onChange={(event) => onFileChange(event, "idCardFront")}
          />
        </ProviderRegistrationField>
        <ProviderRegistrationField label="CCCD/CMND mặt sau" required>
          <ProviderRegistrationUploadBox
            fileName={form.idCardBack}
            onChange={(event) => onFileChange(event, "idCardBack")}
          />
        </ProviderRegistrationField>
        <ProviderRegistrationField label="Số CCCD" required>
          <Input
            required
            name="identityNumber"
            value={form.identityNumber}
            onChange={onInputChange}
            placeholder="012345678901"
          />
        </ProviderRegistrationField>
        <ProviderRegistrationField label="Họ tên trên CCCD" required>
          <Input
            required
            name="identityFullName"
            value={form.identityFullName}
            onChange={onInputChange}
            placeholder="NGUYEN VAN A"
          />
        </ProviderRegistrationField>
        <ProviderRegistrationField label="Ngày sinh">
          <Input
            name="identityDob"
            value={form.identityDob}
            onChange={onInputChange}
            placeholder="dd/mm/yyyy"
          />
        </ProviderRegistrationField>
        <ProviderRegistrationField label="Địa chỉ trên CCCD">
          <Input
            name="identityAddress"
            value={form.identityAddress}
            onChange={onInputChange}
            placeholder="Địa chỉ đọc từ CCCD"
          />
        </ProviderRegistrationField>
        <ProviderRegistrationField label="Giấy đăng ký kinh doanh" required>
          <ProviderRegistrationUploadBox
            fileName={form.businessLicense}
            onChange={(event) => onFileChange(event, "businessLicense")}
          />
        </ProviderRegistrationField>
        <ProviderRegistrationField label="Mã số thuế" required>
          <Input
            required
            name="taxCode"
            value={form.taxCode}
            onChange={onInputChange}
            placeholder="Nhập mã số thuế"
          />
        </ProviderRegistrationField>
        <ProviderRegistrationField
          label="Ảnh doanh nghiệp"
          required
          className="md:col-span-2"
        >
          <ProviderRegistrationUploadBox
            multiple
            fileNames={form.businessImages}
            onChange={(event) => onFileChange(event, "businessImages")}
          />
        </ProviderRegistrationField>
      </div>

      {identityOcrStatus && (
        <p className="rounded-xl bg-info-soft px-4 py-3 text-sm font-semibold text-muted">
          {identityOcrStatus}
        </p>
      )}

      <div className="rounded-2xl border border-border-subtle bg-surface-muted p-5">
        <h3 className="text-lg font-bold">Phương thức thanh toán</h3>
        <p className="mt-1 text-sm text-muted">
          Danh sách ngân hàng được lấy từ API VietQR qua BE.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <ProviderRegistrationField label="Ngân hàng" required>
            <CustomSelect
              value={form.bankCode}
              options={bankOptions}
              onValueChange={(value) => onFieldChange("bankCode", value)}
            />
          </ProviderRegistrationField>
          <ProviderRegistrationField label="Số tài khoản" required>
            <Input
              required
              name="bankAccountNumber"
              value={form.bankAccountNumber}
              onChange={onInputChange}
              placeholder="Nhập số tài khoản"
            />
          </ProviderRegistrationField>
          <ProviderRegistrationField label="Tên chủ tài khoản" required>
            <Input
              required
              name="bankAccountName"
              value={form.bankAccountName}
              onChange={onInputChange}
              placeholder="NGUYEN VAN A"
            />
          </ProviderRegistrationField>
        </div>
      </div>
    </section>
  );
}
