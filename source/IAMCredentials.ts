import { ApiCredentials } from './ApiCredentials';

export interface IAMCredentials extends ApiCredentials { // tslint:disable-line
    accessKeyId: string;
    secretAccessKey: string;
}
