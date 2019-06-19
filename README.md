# serverless-discovery-sdk-js
[![npm](https://img.shields.io/npm/v/%40adastradev%2Fserverless-discovery-sdk.svg)](https://www.npmjs.com/package/@adastradev/serverless-discovery-sdk)
[![license](https://img.shields.io/npm/l/%40adastradev%2Fserverless-discovery-sdk.svg)](https://www.npmjs.com/package/@adastradev/serverless-discovery-sdk)
*The last serverless micro-service you'll ever wonder how to find*

The AWS Serverless Discovery SDK interacts with a discovery microservice to discover endpoints for micro-services written for a serverless architecture. This is similar to clustered services such as [Consul](https://www.consul.io/intro/index.html) or [ZooKeeper](https://zookeeper.apache.org/), but without the concept of instances or nodes that must be monitored for online state. This library is designed to support use both on the server side (for service-to-service lookups) and on the browser/client side.

This project contains the Typescript/Javascript bindings for the discovery service; Other bindings can be found in the [AdAstraDev](https://github.com/adastradev) organization on GitHub

## Installation 
```sh
npm install @adastradev/serverless-discovery-sdk
```
## Usage

#### Service/Cloud Dependencies
Semver versioning is supported by the discovery service 1.1.x. Pass a semver compatible value in the `lookupService` call to receive the newest compatible matching version.
Services and their desired versions can also be specified in the `cloudDependencies` field of `package.json`.

```javascript
{
  "cloudDependencies": {
    "service1": "1.x",
    "service2": "^1.2.8-testbranch", // A pre-release version for development purposes
    "service3": "3.x.x"
  }
}
```

#### Version Postfix values

In some testing environments, it can be useful to modify the lookup version to avoid collision with a production environment. If the `VERSION_POSTFIX` environment variable at **runtime**, it will always append this to the version of a lookup call. 

If you are looking up services which are highly coupled or are not well isolated, and using them for system tests, you should:

- Set the `VERSION_POSTFIX` environment variable set to `-staging`
- Pass the environment variable through to the runtime where lookups are happening (lambda, docker, etc.)

If there is a lookup for **serviceA**, version `1.1.0`, it will instead only talk to `1.1.0-staging`. All lookup calls will follow a similar pattern while the environment variable is present.

**TL;DR**: If you are looking up services which are not well isolated, and rely on a staging environment to avoid operations on prod databases/resources, add the following to your pipeline in a staging deployment/testing step.

bitbucket-pipelines.yml:
```bash
- export VERSION_POSTFIX='-staging'
# Deployment steps follow...
```

serverless.yml
```yaml
provider:
  environment:
    VERSION_POSTFIX: ${env:VERSION_POSTFIX, ''}
```

## Code Example

I recommend setting up a utility function to handle construction of the SDK, and the lookup call - see below example.

```javascript
import { DiscoverySdk } from '@adastradev/serverless-discovery-sdk';

export default async function lookup(serviceName) {

  const sdk = new DiscoverySdk(
    process.env.DISCOVERY_SERVICE_URL,
    process.env.DISCOVERY_SERVICE_REGION,
    // Non-versioned services will default to lookup via this stage
    process.env.DEFAULT_STAGE,
    undefined,
    // Create map of cloudDependencies from package.json
    new Map(Object.entries(require('../path/to/package.json')['cloudDependencies'])),
  );

  const endpoints = await sdk.lookupService(
    serviceName
  );

  return endpoints[0];

}
```
