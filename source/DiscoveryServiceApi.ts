import { ServiceApiModel } from "./ServiceApiModel";
import { ApiCredentials } from "./ApiCredentials";
import { IAMCredentials } from "./IAMCredentials";
import { BearerTokenCredentials } from "./BearerTokenCredentials";

// ignore type checking for private member aws-api-gateway-client for now
declare function require(name:string): any; // tslint:disable-line
const apigClientFactory: any = require('aws-api-gateway-client').default;

export class DiscoveryServiceApi {
    // TODO: create an interface for client to allow plugging in clients for cloud providers other than AWS
    private apigClient: any;
    private additionalParams: any;

    constructor(serviceEndpointUri: string, region: string, credentials: ApiCredentials) {
        if (credentials.type == 'None') {
            this.apigClient = apigClientFactory.newClient({
                invokeUrl: serviceEndpointUri,
                accessKey: '',
                secretKey: '',
                region: region
            });
        }
        else if (credentials.type == 'IAM') {
            const iamCreds = <IAMCredentials>(credentials);
            this.apigClient = apigClientFactory.newClient({
                invokeUrl: serviceEndpointUri,
                accessKey: iamCreds.accessKeyId,
                secretKey: iamCreds.secretAccessKey,
                region: region
            });
        }
        else if (credentials.type == 'BearerToken') {
            const tokenCreds = <BearerTokenCredentials>(credentials);
            this.additionalParams = {
                headers: {
                    Authorization: 'Bearer ' + tokenCreds.idToken
                }
            };
            this.apigClient = apigClientFactory.newClient({
                invokeUrl: serviceEndpointUri,
                accessKey: '',
                secretKey: '',
                region: region
            });
        }
        else {
            throw(Error('Unsupported credential type in DiscoveryServiceApi'));
        }
    }

    getService(id: string) {
        var params = {};
        var pathTemplate = '/catalog/service/' + id;
        var method = 'GET';
        var additionalParams = {};
        var body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    lookupService(ServiceName: string) {
        var params = {};
        var pathTemplate = '/catalog/service';
        var method = 'GET';
        var additionalParams = { queryParams: { ServiceName: ServiceName } };
        var body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    createService(service: ServiceApiModel) {
        var params = {};
        var pathTemplate = '/catalog/service';
        var method = 'POST';
        var additionalParams = {};
        var body = service;

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }

    deleteService(id: string) {
        var params = {};
        var pathTemplate = '/catalog/service/' + id;
        var method = 'DELETE';
        var additionalParams = {};
        var body = {};

        return this.apigClient.invokeApi(params, pathTemplate, method, additionalParams, body);
    }
}

