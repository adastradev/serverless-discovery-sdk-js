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

    public async lookupService(ServiceName: string) {
        const result = await this.api.lookupService(ServiceName);
        const matches = result.data;
        // TODO: filter down results based on a desired stage name
        const exactMatch: ServiceApiModel = matches[0] as ServiceApiModel;
        return exactMatch.ServiceURL;
    }
}
