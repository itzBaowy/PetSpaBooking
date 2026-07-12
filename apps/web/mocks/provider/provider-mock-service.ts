import { providerVerificationMock } from "./provider-verification.mock";
import type { ProviderVerificationProfile } from "@/types/provider";

function simulateDelay(duration: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, duration));
}

export async function getMockProviderVerification(options?: { fail?: boolean }): Promise<ProviderVerificationProfile> {
  await simulateDelay(650);
  if (options?.fail) throw new Error("The mock verification record could not be loaded.");
  return structuredClone(providerVerificationMock);
}
