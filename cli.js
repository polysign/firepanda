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
  switch(cli.input[0]) {
    case 'init':
      const projectConfig = await promptProjectDetails();
      createProject(projectConfig);
      break;
    case 'build':
      buildProject();
      break;
    case 'deploy':
      console.info('Run deploy script');
      break;
  }
  showOutro();
}

const createProject = async (projectConfig) => {
  const basePath = getBasePath();
  const projectBasePath = path.join(process.cwd(), projectConfig.path);

  mkdirp(projectBasePath, async (err) => {
    if (err) { throw(err); }

    const packageJsonPath = path.join(projectBasePath, 'package.json');
  
    await execa('npm', ['init', '-y'], { cwd: projectBasePath });
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    packageJson.name = String(projectConfig.name).toLowerCase();
    packageJson.firepanda = {};
  
    if (Array.from(projectConfig.features).includes('Firestore')) {
      packageJson.firepanda['collections'] = {
        source: 'src/collections',
        output: 'lib/collections'
      }

      mkdirp(path.join(projectBasePath, 'src/collections'));
    }
    if (Array.from(projectConfig.features).includes('Cloud Functions')) {
      packageJson.firepanda['functions'] = {
        source: 'src/functions',
        output: 'lib/functions'
      }

      mkdirp(path.join(projectBasePath, 'src/functions'));
    }
    if (Array.from(projectConfig.features).includes('Frontend')) {
      packageJson.firepanda['fontend'] = {
        source: 'src/frontend',
        output: 'lib/frontend'
      }

      mkdirp(path.join(projectBasePath, 'src/frontend'));
    }

    fs.writeFileSync(path.join(projectBasePath, '.gitignore'), `
      /lib
      /node_modules
      .git
    `);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
    await execa('npm', ['install', 'jest'], { cwd: projectBasePath });
  });
}

const buildProject = async () => {
  const basePath = getBasePath();
  const projectConfig = identifyProject();
}

const identifyProject = () => {
  try {
    return JSON.parse(fs.readFileSync(path.join('./', 'firepanda.json')))
  } catch(e) {
    throw new Error('Not a Firepanda project folder');
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

const promptProjectDetails = async () => {
  const responses = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name'
    },
    {
      type: 'multiselect',
      name: 'features',
      message: 'Enabled features',
      choices: [
        'Firestore',
        'Cloud Functions',
        'Storage',
        'Frontend'
      ]
    },
    {
      type: 'confirm',
      name: 'currentFolder',
      message: 'Initialize in current folder? [no: define path]'
    }
  ]);

  if (!responses.currentFolder) {
    const pathResponse = await prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Project path'
      }
    ]);

    return Object.assign(responses, pathResponse);
  } else {
    return Object.assign({path: '.'}, responses);
  }
}

const showBanner = () => {
  console.info('');
  console.info('Firepanda CLI');
  console.info('-------------');
  console.info('');
}

const showOutro = () => {
  console.info('');
}

runCli();
