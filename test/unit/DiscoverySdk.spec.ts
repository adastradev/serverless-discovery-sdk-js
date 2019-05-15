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

        const sdk = new DiscoverySdk('https://foo.com/bar', '', '', configFile.name);

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
});
