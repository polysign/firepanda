#!/usr/bin/env node
'use strict';

const meow = require('meow');
const path = require('path');
const fs = require('fs-extra');
const ora = require('ora');

const cli = meow(`
  Usage
    $ firepanda init <project-name> <path>
    $ firepanda build
    $ firepanda deploy
`)

if (cli.input.length === 0) {
  console.error('Missing: command')
  cli.showHelp(1)
}

const runCli = async () => {
  const basePath = getBasePath();

  const spinner = ora({
    color: 'yellow',
    prefixText: '> Firepanda'
  });

  switch(cli.input[0]) {
    case 'init':
      if (cli.input[1] && cli.input[2]) {
        await require(`${basePath}/src/cli/init.js`)(spinner, basePath, cli.input[1], cli.input[2]);
      } else {
        throw new Error('Project name and path are missing')
      }
      break;
    case 'build':
      await buildProject();
      break;
    case 'deploy':
      buildProject();
      break;
  }

  spinner.stopAndPersist({ text: 'Done', symbol: '-' });
}

const buildProject = async () => {
  const basePath = getBasePath();
  const projectConfig = identifyProject();

  const build = {
    firestore: require(`${basePath}/src/cli/build-collections.js`),
    functions: require(`${basePath}/src/cli/build-functions.js`),
    storage: require(`${basePath}/src/cli/build-storage.js`)
  };

  if (cli.input[1] && ['firestore', 'storage', 'functions'].includes(cli.input[1])) {
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

const showBanner = (command) => {
  console.info('>');
  console.info(`> Firepanda CLI [${command}]`);
}

runCli();
