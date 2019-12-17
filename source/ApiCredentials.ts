// tslint:disable-next-line: interface-name
export interface ApiCredentials {
    type: ApiCredentialType;
}

export type ApiCredentialType =
    'None' |
    'IAM' |
    'BearerToken';
