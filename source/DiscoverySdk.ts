import { ServiceApiModel } from './ServiceApiModel';
import { DiscoveryServiceApi } from './DiscoveryServiceApi';
import * as appRoot from 'app-root-path';
import * as fs from 'fs';
import * as Path from 'path';

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
                configPath?: string,
                cloudDeps?: Map<string, string>) {

        this.api = new DiscoveryServiceApi(serviceEndpointUri, region || 'us-east-1', { type: 'None' });
        // TODO: attempt to look up stage name from an environment variable
        this.defaultStageName = defaultStageName;

        // If the provided lookupVersionPostfix is undefined, try to find it in an environment variable.
        if (!lookupVersionPostfix) {
            lookupVersionPostfix = process.env.VERSION_POSTFIX;
            if (lookupVersionPostfix) {
                console.log(`DEBUG: Using VERSION_POSTFIX=${lookupVersionPostfix}`);
            } else {
                console.log('DEBUG: VERSION_POSTFIX not found');
            }
        }

        this.lookupVersionPostfix = lookupVersionPostfix;
        this.populateDependencies(configPath, cloudDeps);
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
        console.log(`DEBUG: lookupService called (serviceName: ${serviceName}, stageName: ${stageName}, version: ${version}, externalID: ${externalID}`);

        if (!stageName) {
            stageName = this.defaultStageName;
        }

        // If version hasn't been specified, try to find one from the cloudDependencies
        if (!version) {
            const cloudDep = this.getDependency(serviceName);
            if (cloudDep) {
                version = cloudDep.version;
                console.log(`DEBUG: Using version from config: ${version}`);
            }
        }

        if (version && this.lookupVersionPostfix) {
            version += this.lookupVersionPostfix;
            console.log(`DEBUG: Version updated with postfix: ${version}`);
        }

        if (!externalID) {
            externalID = '';
        }

        const result = await this.api.lookupService(serviceName, stageName, version, externalID);
        return result.data.map((item: ServiceApiModel) => item.ServiceURL);
    }

    private populateDependencies(configPath?: string, cloudDeps?: Map<string, string>) {
        // Can provide all of dependencies or be overridden by a config file.
        if (cloudDeps) {
            console.log(`DEBUG: Passed cloudDeps`);
            console.log(cloudDeps);
            for (const key of Array.from(cloudDeps.keys())) {
                this.cloudDependencies.set(key, {name: key, version: cloudDeps.get(key)!});
            }
        }

        console.log(`DEBUG: populateDependencies: (configPath: ${configPath})`);
        if (configPath !== undefined) {
            this.readConfig(configPath);
        } else {
            // Look for the package.json file in the root project folder
            const basePackagePath = Path.join(appRoot.path, 'package.json');

            if (fs.existsSync(basePackagePath)) {
                console.log(`DEBUG: Searched for config. Found at: ${basePackagePath}`);
                this.readConfig(basePackagePath);
            } else {
                console.log(`DEBUG: Never found a config file at: ${basePackagePath}`);
            }
        }
    }

    private readConfig(configPath: string) {
        console.log(`DEBUG: readConfig (${configPath})`);
        const rawdata = fs.readFileSync(configPath);
        const config = JSON.parse(rawdata.toString('utf8'));

        if (config.hasOwnProperty('cloudDependencies')) {
            console.log(`DEBUG: cloudDependencies found`);
            console.log(config.cloudDependencies);
            for (const key in config.cloudDependencies) {
                if (config.cloudDependencies.hasOwnProperty(key)) {
                    this.cloudDependencies.set(key, {name: key, version: config.cloudDependencies[key]});
                }
            }
        } else {
            console.log(`DEBUG: cloudDependencies section not found in config file.`);
        }
    }
}
