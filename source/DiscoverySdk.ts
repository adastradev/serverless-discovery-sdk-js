import { ServiceApiModel } from "./ServiceApiModel";
import { DiscoveryServiceApi } from './DiscoveryServiceApi';
import { promises } from "fs";

export class DiscoverySdk {
    private api: DiscoveryServiceApi;
    private defaultStageName: string;

    constructor(serviceEndpointUri: string, region: string = 'us-east-1', defaultStageName: string = '') {
        this.api = new DiscoveryServiceApi(serviceEndpointUri, region, { type: 'None' });
        // TODO: attempt to look up stage name from an environment variable
        this.defaultStageName = defaultStageName;
    }

    async lookupService(ServiceName: string) {
        var result = await this.api.lookupService(ServiceName);
        var matches = result.data;
        const exactMatch: ServiceApiModel = matches[0] as ServiceApiModel;
        return exactMatch.ServiceURL;
    }
}
