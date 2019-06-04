import * as chai from 'chai';
import {DiscoverySdk} from '../../source';

const expect = chai.expect;

describe('DiscoverySdk', () => {
    it('Receive cloud dependencies directly', () => {
        const content = '{"service1": "1.x", "service2": "2.x"}';
        const contentMapped = new Map(Object.entries(JSON.parse(content)));

        const sdk = new DiscoverySdk('https://foo.com/bar',
            undefined,
            undefined,
            undefined,
            contentMapped);

        const cloudDependencies = sdk.cloudDependencyNames;
        expect(cloudDependencies).contains('service1');
        expect(cloudDependencies).contains('service2');
        expect(cloudDependencies.length).equals(2);
        expect(sdk.getDependency('service1')!).equal('1.x');
        expect(sdk.getDependency('service2')!).equal('2.x');
    });

    it('Expect lookup of service name only to throw an Error', async () => {
        const sdk = new DiscoverySdk('https://foo.com/bar');

        let passed = false;

        try {
            await sdk.lookupService('foo');
            passed = true;
        } catch (e) {
            expect(e.message).equal('Must provide more than service name only');
        }

        expect(passed).equal(false);
    });

    it('Expect a call using a stage name with version to throw an Error', async () => {
        const sdk = new DiscoverySdk('https://foo.com/bar');

        let passed = false;

        try {
            await sdk.lookupService('foo', 'stage-name', '1.x');
            passed = true;
        } catch (e) {
            expect(e.message).equal('Providing a stageName along with version or externalID is not compatible');
        }

        expect(passed).equal(false);
    });

    it('Expect a call using a stage name with cloudDependencies version to throw an Error', async () => {
        const cloudDependencies = new Map<string, string>();
        cloudDependencies.set('foo', '1.x');

        const sdk = new DiscoverySdk('https://foo.com/bar', undefined, undefined, undefined,
            cloudDependencies);

        let passed = false;

        try {
            await sdk.lookupService('foo', 'stage-name');
            passed = true;
        } catch (e) {
            expect(e.message).equal('Providing a stageName along with version or externalID is not compatible');
        }

        expect(passed).equal(false);
    });

    it('Expect a call using a stage name with externalID to throw an Error', async () => {
        const sdk = new DiscoverySdk('https://foo.com/bar');

        let passed = false;

        try {
            await sdk.lookupService('foo', 'stage-name', undefined, 'external-id');
            passed = true;
        } catch (e) {
            expect(e.message).equal('Providing a stageName along with version or externalID is not compatible');
        }

        expect(passed).equal(false);
    });
});
