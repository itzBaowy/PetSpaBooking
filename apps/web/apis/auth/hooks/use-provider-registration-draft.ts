"use client";

import { useEffect, useState } from "react";

export type ProviderRegistrationFormState = {
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
  businessImages: string[];
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
};

export const initialProviderRegistrationForm: ProviderRegistrationFormState = {
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
  businessImages: [],
  bankCode: "",
  bankAccountNumber: "",
  bankAccountName: "",
};

const providerRegisterDraftKey = "petlink-provider-register-draft";
const providerRegisterStepKey = `${providerRegisterDraftKey}:step`;

function readProviderDraft(): ProviderRegistrationFormState {
  if (typeof window === "undefined") return initialProviderRegistrationForm;

  try {
    const rawDraft = window.sessionStorage.getItem(providerRegisterDraftKey);
    if (!rawDraft) return initialProviderRegistrationForm;

    const parsedDraft = JSON.parse(rawDraft) as Partial<
      ProviderRegistrationFormState & { businessImage?: string }
    >;

    return {
      ...initialProviderRegistrationForm,
      ...parsedDraft,
      businessImages:
        parsedDraft.businessImages ??
        (parsedDraft.businessImage ? [parsedDraft.businessImage] : []),
    };
  } catch {
    return initialProviderRegistrationForm;
  }
}

function readProviderStep() {
  if (typeof window === "undefined") return 1;

  const value = Number(window.sessionStorage.getItem(providerRegisterStepKey));
  return value >= 1 && value <= 3 ? value : 1;
}

export function useProviderRegistrationDraft() {
  const [step, setStep] = useState(readProviderStep);
  const [form, setForm] = useState(readProviderDraft);

  useEffect(() => {
    window.sessionStorage.setItem(
      providerRegisterDraftKey,
      JSON.stringify(form),
    );
    window.sessionStorage.setItem(providerRegisterStepKey, String(step));
  }, [form, step]);

  function updateField(
    name: keyof ProviderRegistrationFormState,
    value: ProviderRegistrationFormState[keyof ProviderRegistrationFormState],
  ) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function clearDraft() {
    window.sessionStorage.removeItem(providerRegisterDraftKey);
    window.sessionStorage.removeItem(providerRegisterStepKey);
  }

  return {
    form,
    setForm,
    step,
    setStep,
    updateField,
    clearDraft,
  };
}
