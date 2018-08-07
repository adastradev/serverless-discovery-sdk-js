# serverless-discovery-sdk-js

*The last serverless micro-service you'll ever wonder how to find*

The AWS Serverless Discovery SDK interacts with a discovery microservice to discover endpoints for micro-services written for a serverless architecture. This is similar to clustered services such as [Consul](https://www.consul.io/intro/index.html) or [ZooKeeper](https://zookeeper.apache.org/), but without the concept of instances or nodes that must be monitored for online state. This library is designed to support use both on the server side (for service-to-service lookups) and on the browser/client side.

This project contains the Typescript/Javascript bindings for the discovery service; Other bindings can be found in the [AdAstraDev](https://github.com/adastradev) organization on GitHub

## Installation 
```sh
npm install @adastradev/serverless-discovery-sdk
```
## Usage
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

