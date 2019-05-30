import * as chai from 'chai';
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
    const SERVICE_URL4 = 'https://discovery-sdk-js4';
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
        registeredServices.push((await api.createService({
            ServiceName: SERVICE_NAME,
            ServiceURL: SERVICE_URL4,
            Version: '2.0.0-staged'
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
        it('Should find a registered service by name and stage', async () => {
            const sdk: DiscoverySdk = new DiscoverySdk(
                Config.discovery_service_endpoint,
                Config.aws_region);
            const endpoints = await sdk.lookupService(SERVICE_NAME, STAGE1);
            expect(endpoints.length).is.equal(1);
            expect(endpoints[0]).is.equal(SERVICE_URL3);
        });

        it('Should find a registered service by name and version', async () => {
            const sdk: DiscoverySdk = new DiscoverySdk(
                Config.discovery_service_endpoint,
                Config.aws_region);
            const endpoints = await sdk.lookupService(SERVICE_NAME, undefined, '1.0.1');
            expect(endpoints.length).is.equal(1);
            expect(endpoints[0]).is.equal(SERVICE_URL3);

        });

        it('Should append version postfix defined in the constructor', async () => {
            const sdk: DiscoverySdk = new DiscoverySdk(
                Config.discovery_service_endpoint,
                Config.aws_region,
                undefined,
                '-staged');
            const endpoints = await sdk.lookupService(SERVICE_NAME, undefined, '2.0.0');
            expect(endpoints.length).is.equal(1);
            expect(endpoints[0]).is.equal(SERVICE_URL4);

        });

        it('Should append version postfix defined in an environment variable', async () => {
            process.env.VERSION_POSTFIX = '-staged';
            const sdk: DiscoverySdk = new DiscoverySdk(
                Config.discovery_service_endpoint,
                Config.aws_region);
            const endpoints = await sdk.lookupService(SERVICE_NAME, undefined, '2.0.0');
            expect(endpoints.length).is.equal(1);
            expect(endpoints[0]).is.equal(SERVICE_URL4);
        });
    });
});
