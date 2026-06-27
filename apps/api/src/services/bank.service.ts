import { VietQR } from "vietqr";
import { BadRequestException } from "../common/helpers/exception.helper.ts";

export interface BankItem {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
    transferSupported: number;
    lookupSupported: number;
}

interface VietQrBankResponse {
    code: string;
    desc: string;
    data: BankItem[];
}

const fallbackBanks: BankItem[] = [
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
        name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
        code: "BIDV",
        bin: "970418",
        shortName: "BIDV",
        logo: "https://api.vietqr.io/img/BIDV.png",
        transferSupported: 1,
        lookupSupported: 1,
    },
];

function isBankResponse(value: unknown): value is VietQrBankResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        "data" in value &&
        Array.isArray((value as { data?: unknown }).data)
    );
}

export const bankService = {
    async getBanks(): Promise<BankItem[]> {
        const clientID = process.env.VIETQR_CLIENT_ID;
        const apiKey = process.env.VIETQR_API_KEY;

        try {
            if (clientID && apiKey) {
                const vietQR = new VietQR({ clientID, apiKey });
                const response = await vietQR.getBanks();

                if (isBankResponse(response)) {
                    return response.data;
                }
            }

            const response = await fetch("https://api.vietqr.io/v2/banks");
            if (!response.ok) {
                throw new BadRequestException("Cannot fetch VietQR bank list");
            }

            const data = (await response.json()) as unknown;
            if (isBankResponse(data)) {
                return data.data;
            }
        } catch {
            return fallbackBanks;
        }

        return fallbackBanks;
    },
};
