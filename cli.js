#!/usr/bin/env node
'use strict';

const execa = require('execa');
const meow = require('meow');
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const { prompt } = require('enquirer');

const cli = meow(`
  Usage
    $ firepanda init
    $ firepanda build
    $ firepanda deploy
`)

if (cli.input.length === 0) {
  console.error('Missing: command')
  cli.showHelp(1)
}

const runCli = async () => {
  showBanner();
  const basePath = getBasePath();

  switch(cli.input[0]) {
    case 'init':
      require(`${basePath}/src/cli/init.js`)();
      break;
    case 'build':
      await buildProject();
      break;
    case 'deploy':
      buildProject();
      break;
  }
  showOutro();
}

const buildProject = async () => {
  const basePath = getBasePath();
  const projectConfig = identifyProject();

  const build = {
    firestore: require(`${basePath}/src/cli/build-collections.js`),
    functions: require(`${basePath}/src/cli/build-functions.js`),
    frontend: require(`${basePath}/src/cli/build-frontend.js`),
    storage: require(`${basePath}/src/cli/build-storage.js`)
  };

  if (cli.input[1] && ['frontend', 'firestore', 'storage', 'functions'].includes(cli.input[1])) {
    await build[cli.input[1]](projectConfig[cli.input[1]]);
  } else {
    await Promise.all(Object.keys(build).map(async (buildKey) => {
      return await build[buildKey](projectConfig[buildKey]);
    }));
  }
}

const identifyProject = () => {
  const packageJsonPath = path.join('./', 'package.json');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
  
    if (packageJson.firepanda) {
      return packageJson.firepanda;
    } else { 
      throw new Error('Not a Firepanda project');
    }
  } catch(e) {
    throw new Error('Not a Firepanda project');
  }
}

const getBasePath = () => {
  try {
    const cliBasePath = path.dirname(process.argv.filter((argvItem) => {
      return argvItem.indexOf('cli.js') !== -1
    }).filter(Boolean)[0]);
    
    return cliBasePath;
  } catch(e) {
    throw new Error('Firepanda base installation path cannot be found');
  } 
}

const showBanner = () => {
  console.info('');
  console.info('Firepanda CLI');
  console.info('-------------');
}

const showOutro = () => {
  console.info('');
}

runCli();
