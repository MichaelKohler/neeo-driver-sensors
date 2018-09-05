'use strict';

let config;

try {
  config = require('../config.json');
} catch (err) {
  // ignore missing config.json file
}

module.exports = {
  getBrainIP,
};

function getBrainIP() {
  const ip = (config && config.brainIP) || process.env.BRAIN_IP;
  return ip;
}