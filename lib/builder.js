'use strict';

const neeoapi = require("neeo-sdk");

module.exports = {
  buildSensorsDriver,
};

// FIXME: use discovery and same approach as multi brain driver
function buildSensorsDriver() {
  return neeoapi.buildDevice('Sensors as Textlabels')
    .setManufacturer('NEEO')
    .setType('ACCESSORY')
    .addAdditionalSearchToken('Sensor');
}