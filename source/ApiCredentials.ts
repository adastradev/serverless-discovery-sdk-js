export interface ApiCredentials {
    type: ApiCredentialType;
}

export type ApiCredentialType =
    'None' |
    'IAM' |
    'BearerToken';
