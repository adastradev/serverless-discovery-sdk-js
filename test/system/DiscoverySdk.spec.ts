import * as chai from 'chai';
import { DiscoverySdk } from '../../source/DiscoverySdk';
import { DiscoveryServiceApi } from '../../source/DiscoveryServiceApi';
import { ServiceApiModel } from '../../source/ServiceApiModel';
import { Config } from './config';

const expect = chai.expect;
const should = chai.should();

describe('DiscoverySdk', () => {
    const api = new DiscoveryServiceApi(Config.discovery_service_endpoint,
        Config.aws_region,
        { type: 'None' });
    let createdService: ServiceApiModel;

    beforeEach(async () => {
        const service: ServiceApiModel = {
            ServiceName: 'serverless-discovery-sdk-js-test',
            ServiceURL: 'https://discovery-sdk-js',
            StageName: 'staging'
        };
        const response = await api.createService(service);
        createdService = response.data;
    });

    afterEach(async () => {
        await api.deleteService(createdService.ServiceID || '');
    });

    describe('When configured with a live discovery service endpoint', () => {
        const sdk: DiscoverySdk = new DiscoverySdk(Config.discovery_service_endpoint, Config.aws_region);
        it('should find a registered service by name', async () => {
            const endpoints = await sdk.lookupService('serverless-discovery-sdk-js-test');
            expect(endpoints.length).is.equal(1);
            expect(endpoints[0]).is.equal('https://discovery-sdk-js');
        });

        it('should find a registered service by name and stage', async () => {
            const endpoints = await sdk.lookupService('serverless-discovery-sdk-js-test', 'staging');
            expect(endpoints.length).is.equal(1);
            expect(endpoints[0]).is.equal('https://discovery-sdk-js');
        });
    });
});
