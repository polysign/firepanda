'use strict';

const execa = require('execa');
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp-promise');

const run = async (spinner, basePath, projectName, projectPath) => {
  await createProject(spinner, basePath, {
    name: projectName,
    path: projectPath
  });
}

const createProject = async (spinner, basePath, projectConfig) => {
  const projectBasePath = path.join(process.cwd(), projectConfig.path);
  const packageJsonPath = path.join(projectBasePath, 'package.json');
  
  spinner.start();
  spinner.text = 'Preparing project';
  return new Promise(async (resolve) => {
    await mkdirp(projectBasePath)
    
    spinner.text = 'Initialising new npm package';
    await execa('npm', ['init', '-y'], { cwd: projectBasePath });
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    packageJson.name = String(projectConfig.name).toLowerCase().split(' ').join('-');

    packageJson.scripts = {
      'test': 'jest',
      'prebuild': 'tsc',
      'build': 'firepanda build',
      'build:firestore': 'firepanda build firestore',
      'build:functions': 'firepanda build functions',
      'build:storage': 'firepanda build storage',
      'deploy': 'firepanda deploy',
      'deploy:firestore': 'firepanda deploy firestore',
      'deploy:functions': 'firepanda deploy functions',
      'deploy:storage': 'firepanda deploy storage',
    }

    packageJson.firepanda = {
      firestore: {
        source: 'src/collections',
        output: 'lib/collections',
        rulesTargetFile: 'lib/collections/firestore.rules'
      },
      functions: {
        source: 'src/functions',
        output: 'lib/functions',
      },
      storage: {
        source: 'src/buckets'
      }
    };

    const projectSourcePath = path.join(projectBasePath, 'src');
    await Promise.all([
      path.join(projectSourcePath, 'collections'),
      path.join(projectSourcePath, 'collections', 'rules'),
      path.join(projectSourcePath, 'functions'),
      path.join(projectSourcePath, 'functions', 'auth'),
      path.join(projectSourcePath, 'functions', 'http'),
      path.join(projectSourcePath, 'functions', 'pubsub'),
      path.join(projectSourcePath, 'functions', 'firestore'),
      path.join(projectSourcePath, 'functions', 'storage'),
      path.join(projectSourcePath, 'functions', 'config'),
      path.join(projectSourcePath, 'buckets'),
      path.join(projectSourcePath, 'buckets', 'rules'),
    ].map(async (pathToCreate) => {
      return await mkdirp(pathToCreate);
    }));

    fs.createFileSync(path.join(projectSourcePath, 'collections/rules', 'sample.rules'));
    fs.writeFileSync(path.join(projectSourcePath, 'collections/rules', 'sample.rules'), fs.readFileSync(path.join(basePath, 'src/cli/templates/firestore', 'rules.sample')));
    fs.writeFileSync(path.join(projectSourcePath, 'buckets/rules', 'sample.rules'), fs.readFileSync(path.join(basePath, 'src/cli/templates/storage', 'rules.sample')));

    fs.writeFileSync(path.join(projectSourcePath, 'functions/auth', 'onCreate.f.ts'), fs.readFileSync(path.join(basePath, 'src/cli/templates/functions', 'authOnCreate.ts')));
    fs.writeFileSync(path.join(projectSourcePath, 'functions/auth', 'onDelete.f.ts'), fs.readFileSync(path.join(basePath, 'src/cli/templates/functions', 'authOnDelete.ts')));    
    fs.writeFileSync(path.join(projectSourcePath, 'functions/config', 'onUpdate.f.ts'), fs.readFileSync(path.join(basePath, 'src/cli/templates/functions', 'configOnUpdate.ts')));

    fs.writeFileSync(path.join(projectBasePath, '.gitignore'), `
      /lib
      /node_modules
      .git
    `);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

    spinner.text = 'Installing dependencies';
    const dependencies = [
      'jest', 'typescript', 'ts-jest', 'camelcase', 'glob',
      'firebase', 'firebase-admin', 'firebase-functions',
      '@google-cloud/pubsub', '@google-cloud/storage', '@google-cloud/bigquery',
      '@google-cloud/scheduler', 
    ];
    await execa('npm', ['install'].concat(dependencies), { cwd: projectBasePath });

    spinner.text = 'Setup Typescript';
    const tsConfigSourcePath = path.join(basePath, 'src/cli/templates', 'tsconfig.json');
    const tsConfigTargetPath = path.join(projectBasePath, 'tsconfig.json');
    fs.copyFileSync(tsConfigSourcePath, tsConfigTargetPath)

    resolve();
  });
}

module.exports = run;
