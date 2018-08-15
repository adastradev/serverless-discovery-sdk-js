import { ApiCredentialType, IAMCredentials } from './index';

export class IAMCredentialsEnvironmentVariables implements IAMCredentials { // tslint:disable-line
    public accessKeyId: string;
    public secretAccessKey: string;
    public type: ApiCredentialType;

    constructor() {
        this.accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
        this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
        this.type = 'IAM';
    }
}
