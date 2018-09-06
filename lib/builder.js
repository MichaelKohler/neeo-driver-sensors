'use strict';

const debug = require('debug')('mk:sensors:builder');
const neeoapi = require('neeo-sdk');

const config = require('./config');
const brainHandler = require('./brainHandler');
const sensorHandler = require('./sensorHandler');

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
    .then((params) => {
      params.brainIP = brainIP;
      return getSDKDeviceWithLabels(params);
    })
    .then(buildDiscoveryResult);
}

function getSDKDeviceWithLabels(params) {
  debug('GOT_SENSORS', params.sensors, params.brainIP);

  const sdkDevice = neeoapi.buildDevice(`${params.brainName} - ${DEFAULT_NAME}`)
    .setManufacturer('NEEO')
    .setType('ACCESSORY');

  const hasSensors = params.sensors && params.sensors.length > 0;
  if (hasSensors) {
    params.sensors.map((sensor) => {
      const name = `${sensor.deviceName}_${sensor.name}_TL`;
      const truncatedSensorLabel = sensor.label.substring(0, 10);
      const label = `${sensor.deviceName} - ${truncatedSensorLabel}`;
      sdkDevice.addTextLabel(
        { name, label },
        sensorHandler.getSensorValueFnBySensor(sensor, params.brainIP)
      );
    });
  }

  debug('Finished building sdk device..', sdkDevice);
  return sdkDevice;
}

function buildDiscoveryResult(sdkDevice) {
  return [{
    id: sdkDevice.devicename,
    name: sdkDevice.devicename,
    device: sdkDevice,
  }];
}

function discover() {
  // TODO: use "real" discovery to discover brains, not from config:
  // https://github.com/MichaelKohler/neeo-driver-sensors/issues/1

  return buildSensorsDriver();
}