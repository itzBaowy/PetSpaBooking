import { useMutation } from "@tanstack/react-query";
import {
  serviceKeys,
  useProviderServices,
  useToggleProviderService,
} from "@/apis/provider/services/queries";

export const pricingKeys = {
  all: serviceKeys.all,
  list: serviceKeys.list,
};

export function usePricing() {
  return useProviderServices();
}

export function useTogglePricingService() {
  return useToggleProviderService();
}

export function useCreatePromotion() {
  return useMutation({
    mutationFn: async () => {
      throw new Error("Backend has no provider promotion API yet.");
    },
  });
}
