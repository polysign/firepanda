#!/usr/bin/env node
'use strict';

const meow = require('meow');
const path = require('path');
const ora = require('ora');
const fs = require('fs-extra');

const cli = meow(`
  Usage
    $ firepanda init <project-name> <path>
    $ firepanda build
    $ firepanda -v
`)

if (cli.flags.v && cli.flags.v === true) {
  cli.showVersion();
}

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
        throw new Error('Project name and path are missing');
      }
      break;
    case 'build':
      const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));
      await require(`${basePath}/src/cli/build.js`)(spinner, packageJson.firepanda);
      break;
  }

  spinner.stopAndPersist({ text: 'Done', symbol: '-' });
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

runCli();
