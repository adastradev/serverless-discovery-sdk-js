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
    private defaultStageName: string;
    private cloudDependencies = new Map<string, ICloudDependency>();

    constructor(serviceEndpointUri: string,
                region: string = 'us-east-1',
                defaultStageName: string = '',
                configPath: string = '') {
        this.api = new DiscoveryServiceApi(serviceEndpointUri, region, { type: 'None' });
        // TODO: attempt to look up stage name from an environment variable
        this.defaultStageName = defaultStageName;
        this.populateDependencies(configPath);
    }

    get cloudDependencyNames() {
        return Array.from(this.cloudDependencies.keys());
    }

    public getDependency(name: string) {
        return this.cloudDependencies.get(name);
    }

    public async lookupService(serviceName: string,
                               stageName: string = this.defaultStageName,
                               version: string = '',
                               externalID: string = '') {
        // If version hasn't been specified, try to find one from the cloudDependencies
        if (!version) {
            const cloudDep = this.getDependency(serviceName);
            if (cloudDep) {
                version = cloudDep.version;
            }
        }

        const result = await this.api.lookupService(serviceName, stageName, version, externalID);
        return result.data.map((item: ServiceApiModel) => item.ServiceURL);
    }

    private populateDependencies(configPath: string) {
        if (configPath.length > 0) {
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
