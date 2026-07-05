"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useBanks } from "@/apis/banks/queries";
import {
  useRegisterProviderApplication,
  useUploadProviderDocument,
} from "@/apis/provider/verification/queries";
import { useIdentityOcr } from "./use-identity-ocr";
import {
  type ProviderMediaField,
  useProviderRegistrationMedia,
} from "./use-provider-registration-media";
import {
  type ProviderRegistrationFormState,
  useProviderRegistrationDraft,
} from "./use-provider-registration-draft";
import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/error";
import {
  getProviderRegistrationErrorMessage,
  getProviderRegistrationReviewItems,
  validateProviderRegistrationStep,
} from "../utils/provider-registration";

export function useProviderApplicationWizard() {
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const registerProviderMutation = useRegisterProviderApplication();
  const uploadDocumentMutation = useUploadProviderDocument();
  const bankQuery = useBanks();
  const router = useRouter();
  const { form, setForm, step, setStep, updateField, clearDraft } =
    useProviderRegistrationDraft();
  const identityOcr = useIdentityOcr();
  const media = useProviderRegistrationMedia();
  const [formError, setFormError] = useState("");

  const isSubmitting =
    registerProviderMutation.isLoading ||
    uploadDocumentMutation.isLoading ||
    isCheckingAvailability;

  const bankOptions = useMemo(
    () => [
      {
        label: bankQuery.isLoading ? "Đang tải ngân hàng..." : "Chọn ngân hàng",
        value: "",
      },
      ...(bankQuery.data ?? []).map((bank) => ({
        label: `${bank.shortName} - ${bank.name}`,
        value: bank.code,
      })),
    ],
    [bankQuery.data, bankQuery.isLoading],
  );

  const reviewItems = useMemo(
    () => getProviderRegistrationReviewItems(form),
    [form],
  );

  function handleInput(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    updateField(
      event.target.name as keyof ProviderRegistrationFormState,
      event.target.value,
    );
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
    name: keyof ProviderRegistrationFormState,
  ) {
    const file = event.target.files?.[0];

    try {
      const previews = await media.selectFiles(
        name as ProviderMediaField,
        event.target.files,
      );
      updateField(
        name,
        name === "businessImages" ? previews : previews[0] ?? "",
      );
      setFormError("");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Không thể đọc ảnh đã chọn.",
      );
      return;
    }

    if (file && name === "idCardFront") {
      const parsed = await identityOcr.scan(file);
      if (!parsed) return;

      setForm((current) => ({
        ...current,
        identityNumber: parsed.identityNumber || current.identityNumber,
        identityFullName: parsed.identityFullName || current.identityFullName,
        identityDob: parsed.identityDob || current.identityDob,
        identityAddress: parsed.identityAddress || current.identityAddress,
      }));
    }
  }

  function validateStep(targetStep = step) {
    return validateProviderRegistrationStep(form, targetStep);
  }

  async function goNext() {
    const message = validateStep();
    if (message) {
      setFormError(message);
      return;
    }

    if (step === 1) {
      setIsCheckingAvailability(true);
      setFormError("");
      try {
        await api.get(
          `/auth/check-availability?userName=${encodeURIComponent(form.userName)}&email=${encodeURIComponent(form.email)}&phone=${encodeURIComponent(form.phone)}`
        );
      } catch (error) {
        setFormError(getErrorMessage(error, "Thông tin đăng ký đã tồn tại trong hệ thống."));
        return;
      } finally {
        setIsCheckingAvailability(false);
      }
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
      setFormError(
        firstStepError ?? secondStepError ?? "Thông tin không hợp lệ.",
      );
      return;
    }

    try {
      setIsCheckingAvailability(true);
      await api.get(
        `/auth/check-availability?userName=${encodeURIComponent(form.userName)}&email=${encodeURIComponent(form.email)}&phone=${encodeURIComponent(form.phone)}`
      );
    } catch (error) {
      setFormError(getErrorMessage(error, "Thông tin đăng ký đã tồn tại trong hệ thống."));
      return;
    } finally {
      setIsCheckingAvailability(false);
    }

    try {
      const { tokens } = await registerProviderMutation.mutateAsync({
        userName: form.userName,
        password: form.password,
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

      // Upload tài liệu bằng token tạm vừa nhận từ kết quả đăng ký
      await Promise.all(
        media.documentUploads.map((payload) =>
          uploadDocumentMutation.mutateAsync({
            ...payload,
            token: tokens.accessToken,
          }),
        ),
      );

      clearDraft();
      router.replace("/login?providerRegistered=1");
    } catch (error) {
      setFormError(getProviderRegistrationErrorMessage(error));
    }
  }

  return {
    form,
    step,
    formError,
    isSubmitting,
    bankOptions,
    reviewItems,
    identityOcrStatus: identityOcr.status,
    hasExistingAccount: false,
    mediaPreviews: media.previews,
    cropper: media.cropper,
    goBack,
    goNext,
    handleInput,
    handleFileChange,
    handleSubmit,
    updateField,
  };
}
