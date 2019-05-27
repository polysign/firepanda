'use strict';

const execa = require('execa');
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const { prompt } = require('enquirer');

const run = async () => {
  createProject(await promptProjectDetails());
}

const promptProjectDetails = async () => {
  const responses = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name'
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


const createProject = async (projectConfig) => {
  const projectBasePath = path.join(process.cwd(), projectConfig.path);

  mkdirp(projectBasePath, async (err) => {
    if (err) { throw(err); }

    const packageJsonPath = path.join(projectBasePath, 'package.json');
  
    await execa('npm', ['init', '-y'], { cwd: projectBasePath });
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    packageJson.name = String(projectConfig.name).toLowerCase().split(' ').join('-');

    packageJson.scripts = {
      'test': 'jest',
      'build': 'firepanda build',
      'build:frontend': 'firepanda build frontend',
      'build:firestore': 'firepanda build firestore',
      'build:functions': 'firepanda build functions',
      'build:storage': 'firepanda build storage',
      'deploy': 'firepanda deploy',
      'deploy:frontend': 'firepanda deploy frontend',
      'deploy:firestore': 'firepanda deploy firestore',
      'deploy:functions': 'firepanda deploy functions',
      'deploy:storage': 'firepanda deploy storage',
    }

    packageJson.firepanda = {
      firestore: {
        source: 'src/collections',
        output: 'lib/collections'
      },
      functions: {
        source: 'src/functions',
        output: 'lib/functions',
      },
      frontend: {
        source: 'src/frontend',
        output: 'lib/frontend'
      },
      storage: {
        source: 'src/buckets'
      }
    };
    
    mkdirp(path.join(projectBasePath, 'src/collections'));
    mkdirp(path.join(projectBasePath, 'src/functions'));
    mkdirp(path.join(projectBasePath, 'src/frontend'));
    mkdirp(path.join(projectBasePath, 'src/buckets'));

    fs.writeFileSync(path.join(projectBasePath, '.gitignore'), `
      /lib
      /node_modules
      .git
    `);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
    await execa('npm', ['install', 'jest'], { cwd: projectBasePath });
  });
}

module.exports = run;
