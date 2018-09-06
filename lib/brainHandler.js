'use strict';

const debug = require('debug')('mk:sensors:brainHandler');
const axios = require('axios');

module.exports = {
  getAllSensorsFromBrain,
};

function getAllSensorsFromBrain(brainIP) {
  return getProjectFile(brainIP)
    .then(getSensorsFromProject)
    .catch((err) => {
      console.error('ERROR_FETCHING_SENSORS', err);
      return [];
    })
}

function getProjectFile(brainIP) {
  const projectPath = `http://${brainIP}:3000/projects/home`;
  debug('Getting project file at', projectPath);
  return axios.get(projectPath)
    .then((response) => response.data);
}

function getSensorsFromProject(project) {
  debug('GETTING_SENSORS', project);
  const sensors = Object.values(project.rooms).reduce((gatheredSensors, room) => {
    const sensorsInRoom = getSensorsInRoom(room);
    gatheredSensors = gatheredSensors.concat(sensorsInRoom);

    return gatheredSensors;
  }, []);

  return {
    brainName: project.label,
    sensors,
  };
}

function getSensorsInRoom(room) {
  const devices = room.devices;
  
  if (!devices || Object.keys(devices).length === 0) {
    return [];
  }

  return Object.values(devices).reduce((sensors, device) => {
    const deviceSensors = device.sensors;

    if (deviceSensors) {
      Object.values(deviceSensors).map((sensor) => {
        sensors.push(sensor);
      });
    }

    return sensors;
  }, []);
}