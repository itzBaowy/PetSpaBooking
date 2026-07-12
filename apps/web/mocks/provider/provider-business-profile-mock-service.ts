import { providerBusinessProfileMock } from "./provider-business-profile.mock";
import type { ProviderBusinessProfileForm } from "@/types/provider";

export async function getMockProviderBusinessProfile(): Promise<ProviderBusinessProfileForm> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 600));
  return structuredClone(providerBusinessProfileMock);
}
