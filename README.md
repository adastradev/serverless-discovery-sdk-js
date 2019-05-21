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

### Environmental

#### Configured Dependencies
Semver versioning is supported by the discovery service 1.1.x.  Pass a semver compatible value in the `lookupService` call to receive the newest compatible matching version.
Services and their desired versions can also be specified in your package.json file.  Enter the values in a `cloudDependencies` section, and populate it in the same format as the standard `dependencies` section.
When using the `cloudDependencies` method, only the service name needs to be provided in the `lookupService` call.

```json
{
  "cloudDependencies": {
    "service1": "1.x.x",
    "service2": "^1.2.8"
  }
}
```

#### Version Postfix values

In some testing environments, it can be useful to modify the lookup version to avoid collision with a production environment.  For example, the service "foo" with version "1.0.0" can instead query version "1.0.0-staging".  To enable this feature at runtime, set the environment variable `VERSION_POSTFIX` to the desired value.  In this case it would be set to `-staging`.  This can especially be useful when using `cloudDependencies` to select service versions.  

### Javascript
```javascript
var DiscoverySdk = require('@adastradev/serverless-discovery-sdk').DiscoverySdk;
var sdk = new DiscoverySdk('https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod', 'us-east-1');

var endpoints = await sdk.lookupService('my-service-name');
```

### TypeScript
```typescript
import { DiscoverySdk } from '@adastradev/serverless-discovery-sdk';
const sdk: DiscoverySdk = new DiscoverySdk('https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod', 'us-east-1');

const endpoints = await sdk.lookupService('my-service-name');

