# overrides to s9pk.mk must precede the include statement
TS_CHECK := npx tsc --noEmit && npm test
include node_modules/@start9labs/start-sdk/s9pk.mk
