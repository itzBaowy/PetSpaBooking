"use client";

import { Button } from "@/components/ui";
import { providerRegistrationHeader } from "../../constants/provider-registration";
import { useProviderApplicationWizard } from "../../hooks/use-provider-application-wizard";
import { ProviderRegistrationAccountStep } from "./account-step";
import { ProviderRegistrationHeader } from "./header";
import { ProviderRegistrationReviewStep } from "./review-step";
import { ProviderRegistrationStepBar } from "./step-bar";
import { ProviderRegistrationVerificationStep } from "./verification-step";

export function ProviderApplicationWizard() {
  const wizard = useProviderApplicationWizard();

  return (
    <form onSubmit={wizard.handleSubmit} className="space-y-10">
      <ProviderRegistrationHeader
        title={providerRegistrationHeader.title}
        description={providerRegistrationHeader.description}
      />

      <ProviderRegistrationStepBar currentStep={wizard.step} />

      {wizard.step === 1 && (
        <ProviderRegistrationAccountStep
          form={wizard.form}
          onInputChange={wizard.handleInput}
        />
      )}

      {wizard.step === 2 && (
        <ProviderRegistrationVerificationStep
          form={wizard.form}
          bankOptions={wizard.bankOptions}
          identityOcrStatus={wizard.identityOcrStatus}
          onInputChange={wizard.handleInput}
          onFileChange={(event, name) => void wizard.handleFileChange(event, name)}
          onFieldChange={wizard.updateField}
        />
      )}

      {wizard.step === 3 && (
        <ProviderRegistrationReviewStep reviewItems={wizard.reviewItems} />
      )}

      {wizard.formError && (
        <p
          role="alert"
          className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger"
        >
          {wizard.formError}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border-subtle pt-6">
        {wizard.step > 1 ? (
          <Button type="button" variant="outline" onClick={wizard.goBack}>
            Quay lại
          </Button>
        ) : (
          <span />
        )}
        {wizard.step < 3 ? (
          <Button type="button" onClick={wizard.goNext}>
            Bước tiếp theo →
          </Button>
        ) : (
          <Button type="submit" disabled={wizard.isSubmitting}>
            {wizard.isSubmitting ? "Đang gửi hồ sơ..." : "Gửi hồ sơ"}
          </Button>
        )}
      </div>
    </form>
  );
}
