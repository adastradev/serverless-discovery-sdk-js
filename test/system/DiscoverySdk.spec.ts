import * as chai from 'chai';
import { DiscoverySdk } from '../../source/DiscoverySdk';
import { Config } from './config';

const expect = chai.expect;
const should = chai.should();

describe('DiscoverySdk', () => {
    beforeEach(() => {
    })

    afterEach(() => {
    })

    describe('When configured with a live discovery service endpoint', () => {
        const sdk: DiscoverySdk = new DiscoverySdk(Config.discovery_service_endpoint, Config.aws_region)
        it('should find a registered service by name and stage', async () => {
            var endpoint = await sdk.lookupService('SystemTest');
            expect(endpoint).is.equal('https://systemtest');
        })
    })
})
