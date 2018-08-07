import { ServiceApiModel } from './ServiceApiModel';
import { ApiCredentials } from './ApiCredentials';
import { IAMCredentials } from './IAMCredentials';
import { BearerTokenCredentials } from './BearerTokenCredentials';

// ignore type checking for private member aws-api-gateway-client for now
declare function require(name:string): any; // tslint:disable-line
const apigClientFactory: any = require('aws-api-gateway-client').default; // tslint:disable-line

export class DiscoveryServiceApi {
    // TODO: create an interface for client to allow plugging in clients for cloud providers other than AWS
    private apigClient: any;
    private additionalParams: any;

    constructor(serviceEndpointUri: string, region: string, credentials: ApiCredentials) {
        if (credentials.type === 'None') {
            this.apigClient = apigClientFactory.newClient({
                accessKey: '',
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: ''
            });
        } else if (credentials.type === 'IAM') {
            const iamCreds = credentials as IAMCredentials;
            this.apigClient = apigClientFactory.newClient({
                accessKey: iamCreds.accessKeyId,
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: iamCreds.secretAccessKey
            });
        } else if (credentials.type === 'BearerToken') {
            const tokenCreds = credentials as BearerTokenCredentials;
            this.additionalParams = {
                headers: {
                    Authorization: 'Bearer ' + tokenCreds.idToken
                }
            };
            this.apigClient = apigClientFactory.newClient({
                accessKey: '',
                invokeUrl: serviceEndpointUri,
                region,
                secretKey: ''
            });
        } else {
            throw(Error('Unsupported credential type in DiscoveryServiceApi'));
        }
    }

    public getService(id: string) {
        const params = {};
        const pathTemplate = '/catalog/service/' + id;
        const method = 'GET';
        const additionalParams = {};
        const body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    public lookupService(ServiceName: string, StageName: string = '') {
        const params = {};
        const pathTemplate = '/catalog/service';
        const method = 'GET';
        const additionalParams = { queryParams: { ServiceName, StageName } };
        const body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    public createService(service: ServiceApiModel) {
        const params = {};
        const pathTemplate = '/catalog/service';
        const method = 'POST';
        const additionalParams = {};
        const body = service;

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    public deleteService(id: string) {
        const params = {};
        const pathTemplate = '/catalog/service/' + id;
        const method = 'DELETE';
        const additionalParams = {};
        const body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }
}
