'use strict';

const execa = require('execa');
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp-promise');
const sleep = require('sleep-promise');
const chalk = require('chalk');

const run = async (spinner, basePath, projectName, projectPath) => {
  await createProject(spinner, basePath, {
    name: projectName,
    path: projectPath
  });

  console.log();
  console.log([chalk.default('New'), chalk.black.bgYellow.bold('Firepanda'), chalk.default('project has been initialised.')].join(' '));
  console.log(chalk.default('Please follow these instructions to finalise the configuration:'));
  console.log();
  console.log(chalk.green('1. Change into the project folder'));
  console.log(['#>', chalk.blue(`cd ${projectPath}`)].join(' '));
  console.log();
  console.log(chalk.green('2. Add Firebase project'));
  console.log(['#>', chalk.blue('firebase use --add')].join(' '));
  console.log();
  console.log(chalk.green('3. Add Firebase configuration in'));
  console.log(['#>', chalk.blue('config/environment.json')].join(' '));
  console.log();
}

const createProject = async (spinner, basePath, projectConfig) => {
  const projectBasePath = path.join(process.cwd(), projectConfig.path);
  const packageJsonPath = path.join(projectBasePath, 'package.json');
  
  spinner.start();
  spinner.text = 'Preparing project... ';
  return new Promise(async (resolve) => {
    await mkdirp(projectBasePath)
    
    spinner.text = 'Initialising new npm package... ';
    await execa('npm', ['init', '-y'], { cwd: projectBasePath });
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    packageJson.name = String(projectConfig.name).toLowerCase().split(' ').join('-');

    packageJson.engines = { node: '8' };
    packageJson.main = 'lib/index.js';
    packageJson.scripts = {
      'test': 'jest',
      'run:web': 'npm run start --prefix ./src/web',
      'build:typescript': 'tsc',
      'build:firepanda': 'firepanda build',
      'build:hosting': 'npm run build --prefix ./src/web',
      'build:firestore': 'npm-run-all -s build:typescript build:firepanda',
      'build:functions': 'npm-run-all -s build:typescript',
      'build:storage': 'npm-run-all -s build:typescript build:firepanda',
      'build': 'npm-run-all -s build:typescript build:firepanda build:hosting',
      'deploy:config': 'firepanda config',
      'deploy:functions': 'firebase deploy --only functions',
      'deploy:storage': 'firebase deploy --only storage',
      'deploy:hosting': 'firebase deploy --only hosting',
      'deploy:firestore': 'firebase deploy --only firestore',
      'deploy': 'firebase deploy'
    };

    packageJson.firepanda = {
      firestore: {
        source: 'src/collections',
        rulesTargetFile: 'lib/collections/firestore.rules',
        indexesTargetFile: 'lib/collections/firestore.indexes.json'
      },
      storage: {
        source: 'src/buckets',
        rulesTargetFile: 'lib/storage.rules'
      }
    };

    const projectSourcePath = path.join(projectBasePath, 'src');
    await Promise.all([
      path.join(projectBasePath, 'config'),
      path.join(projectSourcePath, 'collections'),
      path.join(projectSourcePath, 'collections', 'rules'),
      path.join(projectSourcePath, 'collections', 'indexes'),
      path.join(projectSourcePath, 'functions'),
      path.join(projectSourcePath, 'functions', 'auth'),
      path.join(projectSourcePath, 'functions', 'http'),
      path.join(projectSourcePath, 'functions', 'pubsub'),
      path.join(projectSourcePath, 'functions', 'firestore'),
      path.join(projectSourcePath, 'functions', 'firestore', 'users'),
      path.join(projectSourcePath, 'functions', 'storage'),
      path.join(projectSourcePath, 'functions', 'config'),
      path.join(projectSourcePath, 'functions', 'services'),
      path.join(projectSourcePath, 'buckets'),
      path.join(projectSourcePath, 'buckets', 'rules'),
    ].map(async (pathToCreate) => {
      return await mkdirp(pathToCreate);
    }));

    fs.copyFileSync(path.join(basePath, 'src/cli/templates/config', 'environment.json'), path.join(projectBasePath, 'config', 'environment.json'));

    fs.createFileSync(path.join(projectSourcePath, 'collections/rules', 'sample.rules'));
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/firestore', 'rules.sample'), path.join(projectSourcePath, 'collections/rules', 'sample.rules'));
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/firestore', 'collection.sample'), path.join(projectSourcePath, 'collections', 'Users.ts'));
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/storage', 'rules.sample'), path.join(projectSourcePath, 'buckets/rules', 'sample.rules'));

    // Setup functions
    fs.copyFileSync(path.join(basePath, 'src/cli/templates', 'index.ts'), path.join(projectSourcePath, 'index.ts'));
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/functions', 'authOnCreate.ts'), path.join(projectSourcePath, 'functions/auth', 'onCreate.f.ts'));
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/functions', 'authOnDelete.ts'), path.join(projectSourcePath, 'functions/auth', 'onDelete.f.ts'));    
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/functions', 'configOnUpdate.ts'), path.join(projectSourcePath, 'functions/config', 'onUpdate.f.ts'));
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/functions', 'collection.onCreate.sample'), path.join(projectSourcePath, 'functions/firestore/users', 'onCreate.f.ts'));

    // Setup functions/services
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/services', 'storage.ts'), path.join(projectSourcePath, 'functions/services', 'storage.ts'));
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/services', 'pubsub.ts'), path.join(projectSourcePath, 'functions/services', 'pubsub.ts'));
    fs.copyFileSync(path.join(basePath, 'src/cli/templates/services', 'bigquery.ts'), path.join(projectSourcePath, 'functions/services', 'bigquery.ts'));

    fs.copyFileSync(path.join(basePath, 'src/cli/templates', 'gitignore'), path.join(projectBasePath, '.gitignore'));
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

    await sleep(1000);

    spinner.text = 'Installing developer dependencies... ';
    const devDependencies = [
      'firepanda', 'jest', 'typescript', 'ts-jest', 'camelcase', 'glob',
      'npm-run-all', 'copy'
    ];
    await execa('npm', ['install'].concat(devDependencies), { cwd: projectBasePath });

    spinner.text = 'Installing dependencies... ';
    const dependencies = [
      'firebase', 'firebase-admin', 'firebase-functions', '@google-cloud/pubsub',
      '@google-cloud/storage', '@google-cloud/bigquery', '@google-cloud/scheduler'
    ];
    await execa('npm', ['install'].concat(dependencies), { cwd: projectBasePath });

    spinner.text = 'Setup Typescript... ';
    const tsConfigSourcePath = path.join(basePath, 'src/cli/templates', 'tsconfig.template.json');
    const tsConfigTargetPath = path.join(projectBasePath, 'tsconfig.json');
    fs.copyFileSync(tsConfigSourcePath, tsConfigTargetPath)
    
    await sleep(1000);

    // Setup Firebase project
    spinner.text = 'Setup Firebase... ';
    const firebaseConfigSourcePath = path.join(basePath, 'src/cli/templates', 'firebase.template.json');
    const firebaseConfigTargetPath = path.join(projectBasePath, 'firebase.json');
    fs.copyFileSync(firebaseConfigSourcePath, firebaseConfigTargetPath);
    
    await sleep(1000);

    // Setup Stencil project for web
    spinner.text = 'Setup Stencil... ';
    await execa('npm', ['init', 'stencil', 'app', 'web'], { cwd: projectSourcePath });
    const stencilConfigSourcePath = path.join(basePath, 'src/cli/templates/web', 'stencil.config.ts');
    const stencilConfigTargetPath = path.join(projectSourcePath, 'web', 'stencil.config.ts');
    fs.copyFileSync(stencilConfigSourcePath, stencilConfigTargetPath);
    
    spinner.text = 'Install Stencil dependencies... ';
    await execa('npm', ['install', '@stencil/sass', '@stencil/postcss'], { cwd: path.join(projectSourcePath, 'web') });

    spinner.stop();

    resolve();
  });
}

module.exports = run;
