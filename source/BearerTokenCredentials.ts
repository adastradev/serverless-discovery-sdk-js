import { ApiCredentials } from './ApiCredentials';

// tslint:disable-next-line: interface-name
export interface BearerTokenCredentials extends ApiCredentials {
    idToken: string;
}
