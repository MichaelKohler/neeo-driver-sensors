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
    .then((response) => {
      return response.data;
    });
}

function getSensorsFromProject(project) {
  debug('GETTING_SENSORS', project);
  return {
    brainName: project.label,
    sensors: [] 
  };
}