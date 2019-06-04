import { ServiceApiModel } from './ServiceApiModel';
import { DiscoveryServiceApi } from './DiscoveryServiceApi';

export class DiscoverySdk {
    private api: DiscoveryServiceApi;
    private readonly defaultStageName?: string;
    // Allows version number modification as needed for unique environments
    private readonly lookupVersionPostfix?: string;
    private cloudDependencies = new Map<string, string>();

    constructor(serviceEndpointUri: string,
                region?: string,
                defaultStageName?: string,
                lookupVersionPostfix?: string,
                cloudDeps?: Map<string, string>) {

        this.api = new DiscoveryServiceApi(serviceEndpointUri, region || 'us-east-1', { type: 'None' });
        // TODO: attempt to look up stage name from an environment variable
        this.defaultStageName = defaultStageName;

        // If the provided lookupVersionPostfix is undefined, try to find it in an environment variable.
        if (!lookupVersionPostfix) {
            lookupVersionPostfix = process.env.VERSION_POSTFIX;
        }

        this.lookupVersionPostfix = lookupVersionPostfix;
        if (cloudDeps) {
            this.cloudDependencies = cloudDeps;
        }
    }

    get cloudDependencyNames() {
        return Array.from(this.cloudDependencies.keys());
    }

    public getDependency(name: string) {
        return this.cloudDependencies.get(name);
    }

    public async lookupService(serviceName: string,
                               stageName?: string,
                               version?: string,
                               externalID?: string) {

        // If version hasn't been specified, try to find one from the cloudDependencies
        if (!version) {
            version = this.cloudDependencies.get(serviceName);
        }

        // Only use the default stageName if other filters are not provided
        if (!stageName && !version && !externalID) {
            stageName = this.defaultStageName;
        }

        // Using a stageName with version or externalID is not compatible
        if (stageName && (version || externalID)) {
            throw new Error('Providing a stageName along with version or externalID is not compatible');
        }

        if (version && this.lookupVersionPostfix) {
            version += this.lookupVersionPostfix;
        }

        if (!externalID) {
            externalID = '';
        }

        const result = await this.api.lookupService(serviceName, stageName, version, externalID);
        return result.data.map((item: ServiceApiModel) => item.ServiceURL);
    }
}
