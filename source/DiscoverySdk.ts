import { ServiceApiModel } from './ServiceApiModel';
import { DiscoveryServiceApi } from './DiscoveryServiceApi';
import * as finder from 'find-package-json';
import * as fs from 'fs';

export interface ICloudDependency {
    name: string;
    version: string;
}

export class DiscoverySdk {
    private api: DiscoveryServiceApi;
    private readonly defaultStageName?: string;
    // Allows version number modification as needed for unique environments
    private readonly lookupVersionPostfix?: string;
    private cloudDependencies = new Map<string, ICloudDependency>();

    constructor(serviceEndpointUri: string,
                region?: string,
                defaultStageName?: string,
                lookupVersionPostfix?: string,
                configPath?: string) {

        this.api = new DiscoveryServiceApi(serviceEndpointUri, region || 'us-east-1', { type: 'None' });
        // TODO: attempt to look up stage name from an environment variable
        this.defaultStageName = defaultStageName;

        // If the provided lookupVersionPostfix is undefined, try to find it in an environment variable.
        if (!lookupVersionPostfix) {
            lookupVersionPostfix = process.env.VERSION_POSTFIX;
        }

        this.lookupVersionPostfix = lookupVersionPostfix;
        this.populateDependencies(configPath);
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

        if (!stageName) {
            stageName = this.defaultStageName;
        }

        // If version hasn't been specified, try to find one from the cloudDependencies
        if (!version) {
            const cloudDep = this.getDependency(serviceName);
            if (cloudDep) {
                version = cloudDep.version;
            }
        }

        if (version && this.lookupVersionPostfix) {
            version = version + this.lookupVersionPostfix;
        }

        if (!externalID) {
            externalID = '';
        }

        const result = await this.api.lookupService(serviceName, stageName, version, externalID);
        return result.data.map((item: ServiceApiModel) => item.ServiceURL);
    }

    private populateDependencies(configPath?: string) {
        if (configPath !== undefined) {
            this.readConfig(configPath);
        } else {
            // Look for the package.json file in the root project folder
            const basePackagePath = finder().next().filename;
            if (basePackagePath) {
                this.readConfig(basePackagePath);
            }
        }
    }

    private readConfig(configPath: string) {
        const rawdata = fs.readFileSync(configPath);
        const config = JSON.parse(rawdata.toString('utf8'));

        if (config.hasOwnProperty('cloudDependencies')) {
            for (const key in config.cloudDependencies) {
                if (config.cloudDependencies.hasOwnProperty(key)) {
                    this.cloudDependencies.set(key, {name: key, version: config.cloudDependencies[key]});
                }
            }
        }
    }
}
