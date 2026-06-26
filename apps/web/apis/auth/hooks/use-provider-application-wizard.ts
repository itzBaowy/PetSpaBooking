"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useBanks } from "@/apis/banks/queries";
import {
  useRegisterProviderApplication,
  useUploadProviderDocument,
} from "@/apis/provider/verification/queries";
import { useAuthStore } from "@/stores/auth-store";
import { useRegister } from "../queries";
import { useIdentityOcr } from "./use-identity-ocr";
import {
  type ProviderRegistrationFormState,
  useProviderRegistrationDraft,
} from "./use-provider-registration-draft";
import {
  getProviderDocumentPayloads,
  getProviderRegistrationErrorMessage,
  getProviderRegistrationReviewItems,
  validateProviderRegistrationStep,
} from "../utils/provider-registration";

export function useProviderApplicationWizard() {
  const registerMutation = useRegister();
  const registerProviderMutation = useRegisterProviderApplication();
  const uploadDocumentMutation = useUploadProviderDocument();
  const bankQuery = useBanks();
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const { form, setForm, step, setStep, updateField, clearDraft } =
    useProviderRegistrationDraft();
  const identityOcr = useIdentityOcr();
  const [formError, setFormError] = useState("");

  const isSubmitting =
    registerMutation.isLoading ||
    registerProviderMutation.isLoading ||
    uploadDocumentMutation.isLoading;

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

    if (name === "businessImages") {
      updateField(
        name,
        Array.from(event.target.files ?? []).map(
          (selectedFile) => selectedFile.name,
        ),
      );
      return;
    }

    updateField(name, file?.name ?? "");

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
      setFormError(
        firstStepError ?? secondStepError ?? "Thông tin không hợp lệ.",
      );
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

      await Promise.all(
        getProviderDocumentPayloads(form)
          .filter(([, imageUrl]) => Boolean(imageUrl))
          .map(([documentType, imageUrl]) =>
            uploadDocumentMutation.mutateAsync({ documentType, imageUrl }),
          ),
      );

      clearDraft();
      clearTokens();
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
    goBack,
    goNext,
    handleInput,
    handleFileChange,
    handleSubmit,
    updateField,
  };
}
