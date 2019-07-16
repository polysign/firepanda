'use strict';

const execa = require('execa');
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp-promise');
const sleep = require('sleep-promise');
const chalk = require('chalk');
const _ = require('lodash');

const run = async (spinner, environmentName) => {
  await setConfig(spinner, environmentName);
}

const setConfig = async (spinner, environmentName) => {
  spinner.start();
  spinner.text = 'Preparing Firebase configurations... ';

  const basePath = process.cwd();
  const baseConfigPath = path.join(basePath, 'config', 'environment.json');
  const environmentConfigPath = path.join(basePath, 'config', `environment.${environmentName}.json`);

  let environmentConfig = {};  
  if (fs.existsSync(environmentConfigPath)) {
    environmentConfig = JSON.parse(fs.readFileSync(environmentConfigPath));
  }
  
  const config = _.merge(JSON.parse(fs.readFileSync(baseConfigPath)), environmentConfig);

  const promises = [];
  Object.keys(config).forEach((configKey) => {
    if (typeof config[configKey] === 'object') {
      return Object.keys(config[configKey]).forEach(async (configSubKey) => {
        promises.push(execa('firebase', ['functions:config:set', [[configKey, configSubKey].join('.'), config[configKey][configSubKey]].join('=')]));
      });
    }
  });

  await Promise.all(promises);

  spinner.stop();
}


module.exports = run;
