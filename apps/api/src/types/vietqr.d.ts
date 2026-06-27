declare module "vietqr" {
    export class VietQR {
        constructor(config: { clientID?: string; apiKey?: string });
        getBanks(): Promise<unknown>;
    }
}
