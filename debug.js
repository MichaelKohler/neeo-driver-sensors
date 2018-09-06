"use strict";

const neeoapi = require("neeo-sdk");
const sdkDevices = require('./devices');
const config = require('./lib/config');

const BRAIN_IP = config.getBrainIP();

if (!BRAIN_IP) {
  console.error('NO_BRAIN_IP: please set a NEEO Brain IP in the BRAIN_IP env variable!');
  process.exit(1);
}

neeoapi
  .startServer({
    brain: BRAIN_IP,
    port: 3278,
    name: 'debug-server',
    devices: [...sdkDevices.devices],
  }, {})
  .then(() => console.log('SERVER_READY'))
  .catch((error) => {
    console.error('ERROR:', error);
    process.exit(1);
});
