import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { bankSchema } from "./schema";
import type { Bank } from "./schema";

const fallbackBanks: Bank[] = [
  {
    id: 1,
    name: "Ngân hàng TMCP Ngoại thương Việt Nam",
    code: "VCB",
    bin: "970436",
    shortName: "Vietcombank",
    logo: "https://api.vietqr.io/img/VCB.png",
    transferSupported: 1,
    lookupSupported: 1,
  },
  {
    id: 2,
    name: "Ngân hàng TMCP Kỹ thương Việt Nam",
    code: "TCB",
    bin: "970407",
    shortName: "Techcombank",
    logo: "https://api.vietqr.io/img/TCB.png",
    transferSupported: 1,
    lookupSupported: 1,
  },
  {
    id: 3,
    name: "Ngân hàng TMCP Quân đội",
    code: "MB",
    bin: "970422",
    shortName: "MBBank",
    logo: "https://api.vietqr.io/img/MB.png",
    transferSupported: 1,
    lookupSupported: 1,
  },
];

export function useBanks() {
  return useQuery<Bank[]>({
    queryKey: queryKeys.banks.list(),
    queryFn: async () => {
      try {
        const response = await api.get<ApiResponse<Bank[]>>(
          API_ENDPOINTS.BANKS.LIST,
        );
        return response.data.data.map((bank) => bankSchema.parse(bank));
      } catch {
        return fallbackBanks;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}
