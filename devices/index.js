'use strict';

const builder = require('../lib/builder');

module.exports = {
  devices: [
    builder.buildWrapperDriver(),
  ],
};