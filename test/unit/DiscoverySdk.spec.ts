import * as chai from 'chai';
import * as tmp from 'tmp';
import * as fs from 'fs';
import {DiscoverySdk} from '../../source';

const expect = chai.expect;

describe('DiscoverySdk', () => {
    it('Load config file', () => {
        const packageContents = '{"version": "1.0.0", "cloudDependencies": {"package1": "1.x.x", "package2": "1.2.x"}}';
        const configFile = tmp.fileSync();
        fs.writeFileSync(configFile.name, packageContents);

        const sdk = new DiscoverySdk(
            'https://foo.com/bar',
            undefined,
            undefined,
            undefined,
            configFile.name);

        const cloudDependencies = sdk.cloudDependencyNames;
        expect(cloudDependencies).contains('package1');
        expect(cloudDependencies).contains('package2');
        expect(sdk.getDependency('package1')!.version).equal('1.x.x');
        expect(sdk.getDependency('package2')!.version).equal('1.2.x');

        configFile.removeCallback();
    });

    it('No config file', () => {
        const sdk = new DiscoverySdk('https://foo.com/bar');

        const cloudDependencies = sdk.cloudDependencyNames;
        expect(cloudDependencies.length).equals(0);

        const emptyResult = sdk.getDependency('noExist');
        expect(emptyResult).equal(undefined);
    });

    it('Receive cloud dependencies directly', () => {
        const content = '{"service1": "1.x", "service2": "2.x"}';
        const contentMapped = new Map(Object.entries(JSON.parse(content)));

        const sdk = new DiscoverySdk('https://foo.com/bar', undefined,  undefined, undefined, undefined, contentMapped);

        const cloudDependencies = sdk.cloudDependencyNames;
        expect(cloudDependencies).contains('service1');
        expect(cloudDependencies).contains('service2');
        expect(cloudDependencies.length).equals(2);
        expect(sdk.getDependency('service1')!.version).equal('1.x');
        expect(sdk.getDependency('service2')!.version).equal('2.x');
    });

    it('Receive cloud dependencies directly and overridden by config', () => {
        // Config file setup
        const configContents = '{"version": "1.0.0", "cloudDependencies": {"service2": "3.x", "service3": "3.2.3"}}';
        const configFile = tmp.fileSync();
        fs.writeFileSync(configFile.name, configContents);

        // Direct deps setup
        const contentString = '{"service1": "1.x", "service2": "2.x"}';
        const contentMapped = new Map(Object.entries(JSON.parse(contentString)));

        const sdk = new DiscoverySdk(
            'https://foo.com/bar',
            undefined,
            undefined,
            undefined,
            configFile.name,
            contentMapped);

        const cloudDependencies = sdk.cloudDependencyNames;
        expect(cloudDependencies).contains('service1');
        expect(cloudDependencies).contains('service2');
        expect(cloudDependencies.length).equals(3);
        expect(sdk.getDependency('service1')!.version).equal('1.x');
        expect(sdk.getDependency('service2')!.version).equal('3.x');
        expect(sdk.getDependency('service3')!.version).equal('3.2.3');
        configFile.removeCallback();
    });
});
