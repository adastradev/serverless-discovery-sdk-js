sed -e "s|AWS_REGION|$AWS_REGION|" test/system/config.ts.sample > test/system/config.ts
sed -i -e "s|DISCOVERY_SERVICE_ENDPOINT|$DISCOVERY_SERVICE_ENDPOINT|" test/system/config.ts.sample > test/system/config.ts
npm run-script system-test
