import { ApiCredentials } from './ApiCredentials';

export interface BearerTokenCredentials extends ApiCredentials {
    idToken: string;
}
