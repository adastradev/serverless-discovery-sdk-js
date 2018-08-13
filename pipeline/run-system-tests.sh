sed -e "s|AWS_REGION|$AWS_REGION|" test/system/lib/config.js.sample > test/system/lib/config.js
sed -e "s|DISCOVERY_SERVICE_ENDPOINT|$DISCOVERY_SERVICE_ENDPOINT|" test/system/lib/config.js.sample > test/system/lib/config.js
npm run-script system-test