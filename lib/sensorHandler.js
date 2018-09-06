'use strict';

const debug = require('debug')('mk:sensors:sensorHandler');
const axios = require('axios');

module.exports = {
  getSensorValueFnBySensor,
};

function getSensorValueFnBySensor(sensor, brainIP) {
  return () => {
    debug('GETTING_SENSOR_VALUE', sensor.name);

    const baseURL = `http://${brainIP}:3000/projects/home`;
    const sensorValueURL = `${baseURL}/rooms/${sensor.roomKey}/devices/${sensor.deviceKey}/sensors/${sensor.key}`;

    return axios.get(sensorValuePath)
      .then((response) => {
        return `${sensor.name}: ${response.data.value}`;
      })
      .catch((err) => {
        debug('GETTING_SENSOR_VALUE_ERROR', err);
      });
  };
}