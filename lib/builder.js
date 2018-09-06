'use strict';

const debug = require('debug')('mk:sensors:builder');
const neeoapi = require('neeo-sdk');

const config = require('./config');
const brainHandler = require('./brainHandler');
const sensorHandler = require('./sensorHandler');

const DEFAULT_NAME = 'Sensors as Textlabels';

const POLLING_INTERVAL = 10000;

module.exports = {
  buildWrapperDriver,
  buildSensorsDriver,
};

const discoveryInstructions = {
  headerText: DEFAULT_NAME,
  description: 'This driver allows you to add textlabels for sensors from a NEEO Brain.',
  enableDynamicDeviceBuilder: true,
};

let notifyBrain;
const sensorCache = {};
const pollingCache = [];

function buildWrapperDriver() {
  return neeoapi.buildDevice(DEFAULT_NAME)
    .setManufacturer('NEEO')
    .setType('ACCESSORY')
    .addAdditionalSearchToken('Sensor')
    .enableDiscovery(discoveryInstructions, discover)
    .registerSubscriptionFunction((...args) =>
      setNotificationCallbacks(...args)
    )
    .registerDeviceSubscriptionHandler(
      getSubscriptionHandlers()
    );
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
  sensorCache[params.brainIP] = [];

  const sdkDevice = neeoapi.buildDevice(`${params.brainName} - ${DEFAULT_NAME}`)
    .setManufacturer('NEEO')
    .setType('ACCESSORY');

  const hasSensors = params.sensors && params.sensors.length > 0;
  if (hasSensors) {
    params.sensors.map((sensor) => {
      sensorCache[params.brainIP].push(sensor);

      const [name, label] = buildTextLabelComponentsFromSensor(sensor);

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

function buildTextLabelComponentsFromSensor(sensor) {
  const name = `${sensor.deviceName}_${sensor.name}_TL`;
  const truncatedSensorLabel = sensor.label.substring(0, 15);
  const label = `${sensor.deviceName} - ${truncatedSensorLabel}`;

  return [name, label];
}

function setNotificationCallbacks(updateFunction) {
  notifyBrain = updateFunction;
}

function getSubscriptionHandlers() {
  return {
    deviceAdded: (deviceId) => {
      // FIXME: does not get called at all??
      debug('DEVICE_ADDED', deviceId);
      startPollForAllSensors(deviceId);
    },
    deviceRemoved: (deviceId) => {
      // FIXME: does not get called?
      debug('DEVICE_REMOVED', devideId);
      clearPolling(deviceId);
    },
    initializeDeviceList: (deviceIds) => {
      // FIXME: gets called with empty list???
      debug('INIT_WITH', deviceIds);
      deviceIds.map((deviceId) => {
        startPollForAllSensors(deviceId);
      });
    },
  };
}

function startPollForAllSensors(deviceId) {
  pollingCache[deviceId] = pollingCache[deviceId] || [];

  Object.keys(sensorCache).map((brainIp) => {
    sensorCache[brainIp].map((sensor) => {
      const interval = setInterval(() => {
        const updateFn = sensorHandler.getSensorValueFnBySensor(sensor, brainIp);
        updateFn()
          .then((newValue) => {
            console.log('new value..', newValue);
          });
      }, POLLING_INTERVAL);

      pollingCache[deviceId].push(interval);
    });
  });
}

function clearPolling(deviceId) {
  pollingCache[deviceId].map((pollInterval) => {
    clearInterval(pollInterval);
  });
}