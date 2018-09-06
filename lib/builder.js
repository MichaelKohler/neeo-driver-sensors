'use strict';

const debug = require('debug')('mk:sensors:builder');
const neeoapi = require('neeo-sdk');

const config = require('./config');
const brainHandler = require('./brainHandler');

const DEFAULT_NAME = 'Sensors as Textlabels';

module.exports = {
  buildWrapperDriver,
  buildSensorsDriver,
};

const discoveryInstructions = {
  headerText: DEFAULT_NAME,
  description: 'This driver allows you to add textlabels for sensors from a NEEO Brain.',
  enableDynamicDeviceBuilder: true,
};

function buildWrapperDriver() {
  return neeoapi.buildDevice(DEFAULT_NAME)
    .setManufacturer('NEEO')
    .setType('ACCESSORY')
    .addAdditionalSearchToken('Sensor')
    .enableDiscovery(discoveryInstructions, discover);
}

function buildSensorsDriver() {
  const brainIP = config.getBrainIP();
  return brainHandler.getAllSensorsFromBrain(brainIP)
    .then(getSDKDeviceWithLabels);
}

function getSDKDeviceWithLabels(params) {
  debug('GOT_SENSORS', params.sensors);

  const sdkDevice = neeoapi.buildDevice(`${params.brainName} - ${DEFAULT_NAME}`)
    .setManufacturer('NEEO')
    .setType('ACCESSORY')
    .addAdditionalSearchToken('Sensor')
    .addCapability('alwaysOn')
    .addTextLabel(
      { name: 'artistname', label: 'Artist name', isLabelVisible: false },
      getValue
     )

  // TODO: attach text label per sensor

  debug('Finished building sdk device..', sdkDevice);
  return sdkDevice;
}

function getValue() {
  return 'foo';
}

function discover() {
  return [{
    id: 'brain-from-config',
    name: 'BRAIN FROM CONFIG',
    device: buildSensorsDriver(),
  }]
}