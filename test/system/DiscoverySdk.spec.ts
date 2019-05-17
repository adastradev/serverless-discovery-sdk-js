import * as chai from 'chai';
import * as tmp from 'tmp';
import * as fs from 'fs';
import { Config } from './config';
import {
    DiscoverySdk,
    DiscoveryServiceApi,
    IAMCredentialsEnvironmentVariables } from '../../source';

const expect = chai.expect;

describe('DiscoverySdk', () => {
    const SERVICE_NAME = 'serverless-discovery-sdk-js-test1';
    const SERVICE_URL1 = 'https://discovery-sdk-js1';
    const SERVICE_URL2 = 'https://discovery-sdk-js2';
    const SERVICE_URL3 = 'https://discovery-sdk-js3';
    const STAGE1 = 'staging';
    const registeredServices: string[] = [];

    const api = new DiscoveryServiceApi(Config.discovery_service_endpoint,
        Config.aws_region,
        new IAMCredentialsEnvironmentVariables());

    before(async () => {
        // Register services
        registeredServices.push((await api.createService({
            ServiceName: SERVICE_NAME,
            ServiceURL: SERVICE_URL1,
            Version: '1.0.0'
        })).data.ServiceID);
        registeredServices.push((await api.createService({
            ServiceName: SERVICE_NAME,
            ServiceURL: SERVICE_URL2,
            Version: '1.0.2'
        })).data.ServiceID);
        registeredServices.push((await api.createService({
            ServiceName: SERVICE_NAME,
            ServiceURL: SERVICE_URL3,
            StageName: STAGE1,
            Version: '1.0.1'
        })).data.ServiceID);

        for (const svcId of registeredServices) {
            console.log('Registered: ' + svcId);
        }
    });

    after(async () => {
        // Unregister services
        for (const svcId of registeredServices) {
            console.log('Unregister: ' + svcId);
            await api.deleteService(svcId);
        }
    });

    describe('When configured with a live discovery service endpoint', () => {

        it('should find a registered service by name only and receive highest version', async () => {
            const sdk: DiscoverySdk = new DiscoverySdk(
                Config.discovery_service_endpoint,
                Config.aws_region);

            const endpoints = await sdk.lookupService(SERVICE_NAME);
            expect(endpoints.length).is.equal(1);
            expect(endpoints[0]).is.equal(SERVICE_URL2);
        });

        it('should find a registered service by name and stage', async () => {
            const sdk: DiscoverySdk = new DiscoverySdk(
                Config.discovery_service_endpoint,
                Config.aws_region);
            const endpoints = await sdk.lookupService(SERVICE_NAME, STAGE1);
            expect(endpoints.length).is.equal(1);
            expect(endpoints[0]).is.equal(SERVICE_URL3);
        });

        it('should use version specified in config when specifying name only', async () => {
            const packageContents =
                `{"version": "1.0.0", "cloudDependencies": {"${SERVICE_NAME}": "1.0.1", "package2": "1.2.x"}}`;
            const configFile = tmp.fileSync();
            fs.writeFileSync(configFile.name, packageContents);
            const sdk: DiscoverySdk = new DiscoverySdk(
                Config.discovery_service_endpoint,
                Config.aws_region,
                '',
                configFile.name);

            // Query for service with version 1.0.1 in config file.
            const endpoints = await sdk.lookupService(SERVICE_NAME);
            expect(endpoints[0]).is.equal(SERVICE_URL3);
        });
    });
});
