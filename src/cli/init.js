'use strict';

const execa = require('execa');
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');

const run = async (spinner, basePath, projectName, projectPath) => {
  await createProject(spinner, basePath, {
    name: projectName,
    path: projectPath
  });
}

const createProject = async (spinner, basePath, projectConfig) => {
  const projectBasePath = path.join(process.cwd(), projectConfig.path);

  spinner.start();
  spinner.text = 'Preparing project';
  return new Promise((resolve) => {
    mkdirp(projectBasePath, async (err) => {
      if (err) { throw(err); }

      const packageJsonPath = path.join(projectBasePath, 'package.json');

      spinner.text = 'Initialising new npm package';
      await execa('npm', ['init', '-y'], { cwd: projectBasePath });
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
      packageJson.name = String(projectConfig.name).toLowerCase().split(' ').join('-');

      packageJson.scripts = {
        'test': 'jest',
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
          output: 'lib/collections'
        },
        functions: {
          source: 'src/functions',
          output: 'lib/functions',
        },
        storage: {
          source: 'src/buckets'
        }
      };
      
      mkdirp(path.join(projectBasePath, 'src/collections'));
      mkdirp(path.join(projectBasePath, 'src/functions'));
      mkdirp(path.join(projectBasePath, 'src/buckets'));

      fs.writeFileSync(path.join(projectBasePath, '.gitignore'), `
        /lib
        /node_modules
        .git
      `);
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      spinner.text = 'Installing dependencies';
      await execa('npm', ['install', 'jest', 'typescript'], { cwd: projectBasePath });

      spinner.text = 'Setup Typescript';
      const tsConfigSourcePath = path.join(basePath, 'src/cli/templates', 'tsconfig.json');
      const tsConfigTargetPath = path.join(projectBasePath, 'tsconfig.json');
      fs.copyFileSync(tsConfigSourcePath, tsConfigTargetPath)

      resolve();
    });
  });
}

module.exports = run;
