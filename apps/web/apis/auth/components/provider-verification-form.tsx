"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { createWorker } from "tesseract.js";
import { useRegister, useProfile } from "@/apis/auth/queries";
import { useBanks } from "@/apis/banks/queries";
import {
  useMyProviderDocuments,
  useMyProviderInfo,
  useRegisterProviderApplication,
  useUploadProviderDocument,
} from "@/apis/provider/verification/queries";
import {
  providerDocumentTypeLabels,
  providerStatusLabels,
} from "@/apis/provider/verification/schema";
import type {
  ProviderDocument,
  ProviderInfo,
} from "@/apis/provider/verification/schema";
import { Button, Input, Textarea } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";

type ProviderFormState = {
  userName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  description: string;
  idCardFront: string;
  idCardBack: string;
  identityNumber: string;
  identityFullName: string;
  identityDob: string;
  identityAddress: string;
  businessLicense: string;
  taxCode: string;
  businessImage: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
};

const initialFormState: ProviderFormState = {
  userName: "",
  businessName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  address: "",
  description: "",
  idCardFront: "",
  idCardBack: "",
  identityNumber: "",
  identityFullName: "",
  identityDob: "",
  identityAddress: "",
  businessLicense: "",
  taxCode: "",
  businessImage: "",
  bankCode: "",
  bankAccountNumber: "",
  bankAccountName: "",
};

const providerRegisterDraftKey = "petlink-provider-register-draft";

function getInitialProviderDraft(): ProviderFormState {
  if (typeof window === "undefined") return initialFormState;

  try {
    const rawDraft = window.sessionStorage.getItem(providerRegisterDraftKey);
    if (!rawDraft) return initialFormState;

    return {
      ...initialFormState,
      ...(JSON.parse(rawDraft) as Partial<ProviderFormState>),
    };
  } catch {
    return initialFormState;
  }
}

const steps = [
  {
    id: 1,
    label: "Tài khoản",
    description: "Tạo tài khoản provider và thông tin doanh nghiệp",
  },
  {
    id: 2,
    label: "Xác minh",
    description: "CCCD, giấy phép, ảnh và thanh toán",
  },
  {
    id: 3,
    label: "Hoàn tất",
    description: "Kiểm tra lại và gửi hồ sơ",
  },
] as const;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Thao tác thất bại.";
  }

  return "Thao tác thất bại.";
}

function parseIdentityText(text: string) {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const identityNumber =
    normalized.match(/\b\d{12}\b/)?.[0] ??
    normalized.match(/\b\d{9}\b/)?.[0] ??
    "";
  const dob =
    normalized.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/)?.[0] ??
    "";
  const nameLine =
    lines.find((line) => /họ|ho|full name|name/i.test(line)) ??
    "";
  const addressLine =
    lines.find((line) => /nơi thường trú|noi thuong tru|address|quê quán|que quan/i.test(line)) ??
    "";

  return {
    identityNumber,
    identityDob: dob,
    identityFullName: nameLine
      .replace(/.*(?:họ và tên|ho va ten|full name|name)[:\s]*/i, "")
      .trim(),
    identityAddress: addressLine
      .replace(/.*(?:nơi thường trú|noi thuong tru|address|quê quán|que quan)[:\s]*/i, "")
      .trim(),
    rawText: normalized,
  };
}

function parseIdentityTextV2(text: string) {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  const compactText = normalized.replace(/\s+/g, " ");
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const identityNumber =
    compactText.match(/\b\d{12}\b/)?.[0] ??
    compactText.match(/\b\d{9}\b/)?.[0] ??
    "";
  const identityDob =
    compactText.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/)?.[0] ?? "";
  const nameIndex = lines.findIndex((line) =>
    /full\s*name|name|ho\s*va\s*ten|họ\s*và\s*tên/i.test(line),
  );
  const addressIndex = lines.findIndex((line) =>
    /place\s*of\s*residence|residence|address|noi\s*thuong\s*tru|nơi\s*thường\s*trú|que\s*quan|quê\s*quán/i.test(
      line,
    ),
  );
  const nameLine = nameIndex >= 0 ? lines[nameIndex] : "";
  const nextNameLine = nameIndex >= 0 ? lines[nameIndex + 1] ?? "" : "";
  const addressLine = addressIndex >= 0 ? lines[addressIndex] : "";
  const nextAddressLines =
    addressIndex >= 0
      ? lines.slice(addressIndex + 1, addressIndex + 3).join(", ")
      : "";

  return {
    identityNumber,
    identityDob,
    identityFullName:
      nameLine
        .replace(/.*(?:full\s*name|name|ho\s*va\s*ten|họ\s*và\s*tên)[:\s]*/i, "")
        .trim() || nextNameLine,
    identityAddress:
      addressLine
        .replace(
          /.*(?:place\s*of\s*residence|residence|address|noi\s*thuong\s*tru|nơi\s*thường\s*trú|que\s*quan|quê\s*quán)[:\s]*/i,
          "",
        )
        .trim() || nextAddressLines,
    rawText: normalized,
  };
}

void parseIdentityText;

export function ProviderVerificationForm() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const profileQuery = useProfile();
  const role = profileQuery.data?.role;
  const providerQuery = useMyProviderInfo(
    Boolean(accessToken && role === "PENDING_PROVIDER"),
  );
  const documentQuery = useMyProviderDocuments(Boolean(providerQuery.data));

  if (accessToken && profileQuery.isLoading) {
    return <LoadingState text="Đang kiểm tra tài khoản..." />;
  }

  if (role === "ADMIN") {
    return <AlreadyPrivilegedState roleLabel="quản trị viên" />;
  }

  if (role === "PENDING_PROVIDER") {
    if (providerQuery.isLoading) {
      return <LoadingState text="Đang tải hồ sơ chờ duyệt..." />;
    }

    return (
      <PendingProviderState
        provider={providerQuery.data}
        documents={documentQuery.data ?? []}
        isLoadingDocuments={documentQuery.isLoading}
        onLogout={clearTokens}
      />
    );
  }

  return <ProviderApplicationWizard />;
}

function ProviderApplicationWizard() {
  const registerMutation = useRegister();
  const registerProviderMutation = useRegisterProviderApplication();
  const uploadDocumentMutation = useUploadProviderDocument();
  const bankQuery = useBanks();
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 1;
    return Number(window.sessionStorage.getItem(`${providerRegisterDraftKey}:step`)) || 1;
  });
  const [form, setForm] = useState<ProviderFormState>(getInitialProviderDraft);
  const [formError, setFormError] = useState("");
  const [ocrStatus, setOcrStatus] = useState("");

  const isSubmitting =
    registerMutation.isLoading ||
    registerProviderMutation.isLoading ||
    uploadDocumentMutation.isLoading;

  useEffect(() => {
    window.sessionStorage.setItem(providerRegisterDraftKey, JSON.stringify(form));
    window.sessionStorage.setItem(`${providerRegisterDraftKey}:step`, String(step));
  }, [form, step]);

  const reviewItems = useMemo(
    () => [
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
      ["CCCD mặt trước", form.idCardFront],
      ["CCCD mặt sau", form.idCardBack],
      ["Giấy đăng ký kinh doanh", form.businessLicense],
      ["Mã số thuế", form.taxCode],
      ["Ảnh doanh nghiệp", form.businessImage],
    ],
    [form],
  );

  function updateField(name: keyof ProviderFormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleInput(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    updateField(event.target.name as keyof ProviderFormState, event.target.value);
  }

  async function runIdentityOcr(file: File) {
    setOcrStatus("Đang quét CCCD bằng OCR...");

    try {
      const worker = await createWorker("eng");
      const result = await worker.recognize(file);
      await worker.terminate();
      const parsed = parseIdentityTextV2(result.data.text);

      setForm((current) => ({
        ...current,
        identityNumber: parsed.identityNumber || current.identityNumber,
        identityFullName: parsed.identityFullName || current.identityFullName,
        identityDob: parsed.identityDob || current.identityDob,
        identityAddress: parsed.identityAddress || current.identityAddress,
      }));
      setOcrStatus(
        parsed.identityNumber || parsed.identityFullName
          ? "Đã quét CCCD. Vui lòng kiểm tra và sửa nếu OCR đọc sai."
          : "OCR chưa đọc rõ thông tin. Vui lòng nhập thủ công.",
      );
    } catch {
      setOcrStatus("Không thể quét CCCD. Vui lòng nhập thủ công.");
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
    name: keyof ProviderFormState,
  ) {
    const file = event.target.files?.[0];
    updateField(name, file?.name ?? "");

    if (file && name === "idCardFront") {
      void runIdentityOcr(file);
    }
  }

  function validateStep(targetStep = step): string | null {
    if (targetStep === 1) {
      if (!form.userName.trim()) return "Vui lòng nhập tên đăng nhập.";
      if (!form.businessName.trim()) return "Vui lòng nhập tên doanh nghiệp.";
      if (!form.email.trim()) return "Vui lòng nhập email doanh nghiệp.";
      if (!form.phone.trim()) return "Vui lòng nhập số điện thoại.";
      if (!form.password || form.password.length < 8) {
        return "Mật khẩu phải có ít nhất 8 ký tự.";
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
      if (!form.businessImage) return "Vui lòng tải ảnh doanh nghiệp.";
      if (!form.bankCode) return "Vui lòng chọn ngân hàng.";
      if (!form.bankAccountNumber.trim()) return "Vui lòng nhập số tài khoản.";
      if (!form.bankAccountName.trim()) return "Vui lòng nhập tên chủ tài khoản.";
    }

    return null;
  }

  function goNext() {
    const message = validateStep();
    if (message) {
      setFormError(message);
      return;
    }
    setFormError("");
    setStep((current) => Math.min(current + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setFormError("");
    setStep((current) => Math.max(current - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const firstStepError = validateStep(1);
    const secondStepError = validateStep(2);
    if (firstStepError || secondStepError) {
      setFormError(firstStepError ?? secondStepError ?? "Thông tin không hợp lệ.");
      return;
    }

    try {
      const tokens = await registerMutation.mutateAsync({
        userName: form.userName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setTokens(tokens);

      await registerProviderMutation.mutateAsync({
        businessName: form.businessName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        description: form.description,
        taxCode: form.taxCode,
        bankCode: form.bankCode,
        bankAccountNumber: form.bankAccountNumber,
        bankAccountName: form.bankAccountName,
        identityNumber: form.identityNumber,
        identityFullName: form.identityFullName,
        identityDob: form.identityDob,
        identityAddress: form.identityAddress,
      });

      const documentPayloads = [
        ["id_card_front", form.idCardFront],
        ["id_card_back", form.idCardBack],
        ["business_license", form.businessLicense],
        ["tax_code", form.taxCode],
        ["other", form.businessImage],
      ] as const;

      await Promise.all(
        documentPayloads
          .filter(([, imageUrl]) => Boolean(imageUrl))
          .map(([documentType, imageUrl]) =>
            uploadDocumentMutation.mutateAsync({ documentType, imageUrl }),
          ),
      );
      window.sessionStorage.removeItem(providerRegisterDraftKey);
      window.sessionStorage.removeItem(`${providerRegisterDraftKey}:step`);
      clearTokens();
      router.replace("/login?providerRegistered=1");
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <Header
        title="Đăng ký tài khoản nhà cung cấp"
        description="Hoàn tất 3 bước để tạo tài khoản provider và gửi hồ sơ doanh nghiệp chờ quản trị viên duyệt."
      />

      <StepBar currentStep={step} />

      {step === 1 && (
        <section className="grid gap-5 md:grid-cols-2">
          <Field label="Tên đăng nhập" required>
            <Input
              required
              name="userName"
              value={form.userName}
              onChange={handleInput}
              placeholder="petlink_provider"
            />
          </Field>
          <Field label="Tên doanh nghiệp" required>
            <Input
              required
              name="businessName"
              value={form.businessName}
              onChange={handleInput}
              placeholder="VD: Paws & Whiskers Spa"
            />
          </Field>
          <Field label="Email doanh nghiệp" required>
            <Input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleInput}
              placeholder="business@example.com"
            />
          </Field>
          <Field label="Số điện thoại" required>
            <Input
              required
              name="phone"
              value={form.phone}
              onChange={handleInput}
              placeholder="0901 234 567"
            />
          </Field>
          <Field label="Mật khẩu" required>
            <Input
              required
              type="password"
              name="password"
              value={form.password}
              onChange={handleInput}
              placeholder="Tối thiểu 8 ký tự"
            />
          </Field>
          <Field label="Xác nhận mật khẩu" required>
            <Input
              required
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleInput}
              placeholder="Nhập lại mật khẩu"
            />
          </Field>
          <Field label="Địa chỉ doanh nghiệp" required className="md:col-span-2">
            <Input
              required
              name="address"
              value={form.address}
              onChange={handleInput}
              placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
            />
          </Field>
          <Field label="Mô tả doanh nghiệp" className="md:col-span-2">
            <Textarea
              name="description"
              value={form.description}
              onChange={handleInput}
              placeholder="Mô tả cơ sở và dịch vụ nổi bật..."
            />
          </Field>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="CCCD/CMND mặt trước" required>
              <UploadBox
                fileName={form.idCardFront}
                onChange={(event) => handleFileChange(event, "idCardFront")}
              />
            </Field>
            <Field label="CCCD/CMND mặt sau" required>
              <UploadBox
                fileName={form.idCardBack}
                onChange={(event) => handleFileChange(event, "idCardBack")}
              />
            </Field>
            <Field label="Số CCCD" required>
              <Input
                required
                name="identityNumber"
                value={form.identityNumber}
                onChange={handleInput}
                placeholder="012345678901"
              />
            </Field>
            <Field label="Họ tên trên CCCD" required>
              <Input
                required
                name="identityFullName"
                value={form.identityFullName}
                onChange={handleInput}
                placeholder="NGUYEN VAN A"
              />
            </Field>
            <Field label="Ngày sinh">
              <Input
                name="identityDob"
                value={form.identityDob}
                onChange={handleInput}
                placeholder="dd/mm/yyyy"
              />
            </Field>
            <Field label="Địa chỉ trên CCCD">
              <Input
                name="identityAddress"
                value={form.identityAddress}
                onChange={handleInput}
                placeholder="Địa chỉ đọc từ CCCD"
              />
            </Field>
            <Field label="Giấy đăng ký kinh doanh" required>
              <UploadBox
                fileName={form.businessLicense}
                onChange={(event) => handleFileChange(event, "businessLicense")}
              />
            </Field>
            <Field label="Mã số thuế" required>
              <Input
                required
                name="taxCode"
                value={form.taxCode}
                onChange={handleInput}
                placeholder="Nhập mã số thuế"
              />
            </Field>
            <Field label="Ảnh doanh nghiệp" required className="md:col-span-2">
              <UploadBox
                fileName={form.businessImage}
                onChange={(event) => handleFileChange(event, "businessImage")}
              />
            </Field>
          </div>
          {ocrStatus && (
            <p className="rounded-xl bg-info-soft px-4 py-3 text-sm font-semibold text-muted">
              {ocrStatus}
            </p>
          )}

          <div className="rounded-2xl border border-border-subtle bg-surface-muted p-5">
            <h3 className="text-lg font-bold">Phương thức thanh toán</h3>
            <p className="mt-1 text-sm text-muted">
              Danh sách ngân hàng được lấy từ API VietQR qua BE.
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <Field label="Ngân hàng" required>
                <select
                  required
                  name="bankCode"
                  value={form.bankCode}
                  onChange={handleInput}
                  className="h-11 w-full rounded-xl border border-border-muted bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft"
                >
                  <option value="">
                    {bankQuery.isLoading ? "Đang tải ngân hàng..." : "Chọn ngân hàng"}
                  </option>
                  {(bankQuery.data ?? []).map((bank) => (
                    <option key={`${bank.code}-${bank.bin}`} value={bank.code}>
                      {bank.shortName} - {bank.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Số tài khoản" required>
                <Input
                  required
                  name="bankAccountNumber"
                  value={form.bankAccountNumber}
                  onChange={handleInput}
                  placeholder="Nhập số tài khoản"
                />
              </Field>
              <Field label="Tên chủ tài khoản" required>
                <Input
                  required
                  name="bankAccountName"
                  value={form.bankAccountName}
                  onChange={handleInput}
                  placeholder="NGUYEN VAN A"
                />
              </Field>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-border-subtle bg-surface-muted p-5">
            <h3 className="text-lg font-bold">Kiểm tra thông tin</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {reviewItems.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {label}
                  </p>
                  <p className="mt-1 break-all text-sm font-bold text-foreground">
                    {value || "Chưa cung cấp"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm leading-6 text-muted">
            <input required type="checkbox" className="mt-1 h-4 w-4 accent-brand" />
            Tôi xác nhận thông tin cung cấp là chính xác và đồng ý với điều khoản dành cho nhà cung cấp.
          </label>
        </section>
      )}

      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger"
        >
          {formError}
        </p>
      )}

      {registerMutation.isSuccess ? (
        <SuccessState />
      ) : (
        <div className="flex items-center justify-between border-t border-border-subtle pt-6">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={goBack}>
              Quay lại
            </Button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <Button type="button" onClick={goNext}>
              Bước tiếp theo →
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi hồ sơ..." : "Gửi hồ sơ"}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}

function StepBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3">
      {steps.map((item, index) => {
        const active = item.id === currentStep;
        const complete = item.id < currentStep;

        return (
          <div key={item.id} className="relative text-center">
            {index > 0 && (
              <span
                className={`absolute right-1/2 top-5 h-0.5 w-full ${
                  active || complete ? "bg-brand" : "bg-border-subtle"
                }`}
              />
            )}
            <span
              className={`relative z-10 mx-auto grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold ${
                active || complete
                  ? "border-brand bg-brand text-white"
                  : "border-surface-soft bg-surface-soft text-muted"
              }`}
            >
              {complete ? "✓" : item.id}
            </span>
            <p className={`mt-2 text-sm font-bold ${active ? "text-brand" : "text-muted"}`}>
              {item.label}
            </p>
            <p className="mx-auto mt-1 hidden max-w-40 text-xs leading-5 text-muted sm:block">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SuccessState() {
  return (
    <div className="rounded-2xl border border-success/20 bg-success-soft p-5 text-sm font-semibold text-success">
      Đã gửi hồ sơ đăng ký nhà cung cấp. Bạn có thể đăng nhập bằng tài khoản vừa tạo để xem trạng thái hồ sơ.
    </div>
  );
}

function PendingProviderState({
  provider,
  documents,
  isLoadingDocuments,
  onLogout,
}: {
  provider?: ProviderInfo;
  documents: ProviderDocument[];
  isLoadingDocuments: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center space-y-6 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-warning-soft text-4xl text-warning">
        ⏳
      </div>
      <div>
        <h1 className="text-3xl font-bold">
          Đăng ký thành công, hồ sơ đang chờ duyệt
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">
          Tài khoản của bạn đang ở trạng thái chờ duyệt. Bạn chỉ có thể xem hồ
          sơ đã gửi; sau khi quản trị viên duyệt, tài khoản sẽ tự động trở
          thành nhà cung cấp.
        </p>
      </div>

      <div className="w-full max-w-3xl rounded-2xl border border-border-subtle bg-surface-muted p-5 text-left">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard label="Mã hồ sơ" value={provider?.id ?? "Đang cập nhật"} />
          <InfoCard
            label="Trạng thái"
            value={
              provider
                ? providerStatusLabels[provider.providerStatus] ??
                  provider.providerStatus
                : "PENDING_VERIFICATION"
            }
          />
          <InfoCard
            label="Tên doanh nghiệp"
            value={provider?.businessName ?? "Đang cập nhật"}
          />
        </div>
        {provider?.adminNote && (
          <p className="mt-5 rounded-xl bg-warning-soft p-4 text-sm font-semibold text-warning">
            Ghi chú quản trị: {provider.adminNote}
          </p>
        )}
      </div>

      <div className="w-full max-w-3xl rounded-2xl border border-border-subtle bg-surface p-5 text-left">
        <h3 className="text-lg font-bold">Tài liệu đã gửi</h3>
        {isLoadingDocuments ? (
          <p className="mt-3 text-sm text-muted">Đang tải tài liệu...</p>
        ) : documents.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="rounded-xl border border-border-subtle bg-surface-muted p-4"
              >
                <p className="text-sm font-bold">
                  {providerDocumentTypeLabels[document.documentType] ??
                    document.documentType}
                </p>
                <p className="mt-1 break-all text-xs text-muted">
                  {document.imageUrl}
                </p>
                <p className="mt-3 text-xs font-semibold text-brand">
                  Trạng thái: {document.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Chưa có tài liệu nào.</p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onLogout}
        className="h-12"
      >
        Đăng xuất
      </Button>
    </div>
  );
}

function ProviderInfoPage({
  provider,
  documents,
  isLoadingDocuments,
}: {
  provider: ProviderInfo;
  documents: ProviderDocument[];
  isLoadingDocuments: boolean;
}) {
  return (
    <div className="space-y-8">
      <Header
        title="Thông tin hồ sơ nhà cung cấp"
        description="Đây là trạng thái hồ sơ hiện tại của bạn trên hệ thống PetLink."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Mã hồ sơ" value={provider.id} />
        <InfoCard
          label="Trạng thái"
          value={
            providerStatusLabels[provider.providerStatus] ??
            provider.providerStatus
          }
        />
        <InfoCard label="Tên cơ sở" value={provider.businessName} />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-muted p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand">
          Ghi chú quản trị
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          {provider.adminNote || "Chưa có ghi chú từ quản trị viên."}
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <h3 className="text-lg font-bold">Tài liệu đã gửi</h3>
        {isLoadingDocuments ? (
          <p className="mt-3 text-sm text-muted">Đang tải tài liệu...</p>
        ) : documents.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="rounded-xl border border-border-subtle bg-surface-muted p-4"
              >
                <p className="text-sm font-bold">
                  {providerDocumentTypeLabels[document.documentType] ??
                    document.documentType}
                </p>
                <p className="mt-1 break-all text-xs text-muted">
                  {document.imageUrl}
                </p>
                <p className="mt-3 text-xs font-semibold text-brand">
                  Trạng thái: {document.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Chưa có tài liệu nào.</p>
        )}
      </div>
    </div>
  );
}

function CustomerBlockedState({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold">Tài khoản customer không dùng cho cổng này</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        Cổng web chỉ dành cho quản trị viên và nhà cung cấp. Hãy đăng xuất để
        tạo tài khoản provider mới.
      </p>
      <Button className="mt-8" onClick={onLogout}>
        Đăng xuất để tạo tài khoản provider
      </Button>
    </div>
  );
}

function AlreadyPrivilegedState({ roleLabel }: { roleLabel: string }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold">Tài khoản đã có quyền</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        Tài khoản này đã là {roleLabel}, nên không cần gửi hồ sơ đăng ký nhà
        cung cấp nữa.
      </p>
      <Link
        href="/provider"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-brand px-8 font-bold text-white hover:bg-brand-hover"
      >
        Về dashboard
      </Link>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="grid min-h-[420px] place-items-center text-sm font-semibold text-muted">
      {text}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-muted p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 break-all text-base font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

void ProviderInfoPage;
void CustomerBlockedState;
void InfoCard;

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
    <label
      className={`block space-y-1.5 text-sm font-semibold text-foreground ${className ?? ""}`}
    >
      <span>
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
        {description}
      </p>
    </div>
  );
}

function UploadBox({
  fileName,
  onChange,
}: {
  fileName?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-muted bg-surface-muted px-4 text-center text-sm font-medium text-muted hover:border-brand hover:bg-brand-soft">
      <input
        type="file"
        className="sr-only"
        accept=".jpg,.jpeg,.png"
        onChange={onChange}
      />
      <span className="text-xl text-brand">↑</span>
      {fileName || "Tải lên PDF, PNG hoặc JPG"}
    </label>
  );
}
