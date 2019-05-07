import { ServiceApiModel } from './ServiceApiModel';
import { DiscoveryServiceApi } from './DiscoveryServiceApi';

export class DiscoverySdk {
    private api: DiscoveryServiceApi;
    private defaultStageName: string;

    constructor(serviceEndpointUri: string, region: string = 'us-east-1', defaultStageName: string = '') {
        this.api = new DiscoveryServiceApi(serviceEndpointUri, region, { type: 'None' });
        // TODO: attempt to look up stage name from an environment variable
        this.defaultStageName = defaultStageName;
    }

    public async lookupService(serviceName: string, stageName: string = this.defaultStageName, version: string = '', externalID: string = '') {
        const result = await this.api.lookupService(serviceName, stageName, version, externalID);
        const matches = result.data;
        return result.data.map((item: ServiceApiModel) => item.ServiceURL);
    }
}
