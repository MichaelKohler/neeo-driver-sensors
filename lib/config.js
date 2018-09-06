'use strict';

const debug = require('debug')('mk:sensors:config');

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
  debug('RETURNING_IP', ip);
  return ip;
}