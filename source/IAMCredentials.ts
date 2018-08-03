import { ApiCredentials } from "./ApiCredentials";

export interface IAMCredentials extends ApiCredentials {
    accessKeyId: string;
    secretAccessKey: string;
}
