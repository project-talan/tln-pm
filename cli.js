#!/usr/bin/env node
'use strict';

const defaultFileName = '.tpm.yml';
const defaultPort = 5445;

const path = require('path');
const fs = require('fs');
const exec = require('child_process').execSync;

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const getApp = async (fn) => {
  const a = require('./src/app').create();
  await a.init();
  await fn(a);
}

yargs(hideBin(process.argv))
  .help('help').alias('help', 'h')
  .usage('Project management as Code\nUsage:\n $0 <command> [options]')
  .option('verbose', { alias: 'v', count: true, default: 0 })
  .option('g', { describe: 'Assignee, if not defined git user email will be used', alias: 'assignee', default: null, type: 'string' })
  .option('a', { describe: 'Show all elements', alias: 'all', default: false, type: 'boolean' })
  // 
  .command('ls [assignee]', 'Show list of tasks', (yargs) => {
    return yargs;
  }, async (argv) => {
    getApp(async (a) => {
      // find assignee
      let nonGit = false;
      let assignee = argv.assignee;
      const cwd = process.cwd();
      let home = cwd;
      try {
        assignee = exec(`git config --local --get user.email`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      } catch (e) {
        nonGit = true;
      }
      // find home: cwd or git home
      try {
        home = exec(`git rev-parse --show-toplevel`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      } catch (e) {
        console.debug('tpm is executed outside of git repository');
      }
      // notify user
      if (nonGit) {
        nonGit = true;
      }

      if (assignee !== null) {
        await a.ls(home, cwd, assignee);
      } else {
        console.error('Assignee is not defined, please use -g option');
      } 
    });
  })
  // 
  .command('sync', 'Store current status in the file', (yargs) => {
    return yargs
      .positional('file', {
        describe: 'File name to store status',
        default: defaultFileName
      });
  }, async (argv) => {
  })
  // 
  .command('diff', 'Compare current status with stored one', (yargs) => {
    return yargs
      .positional('file', {
        describe: 'File name to read status from',
        default: defaultFileName
      });
  }, async (argv) => {
  })
  //
  .command('serve [port]', 'Start the server', (yargs) => {
    return yargs
      .positional('port', {
        describe: 'Port to bind on',
        default: defaultPort
      });
  }, (argv) => {
    if (argv.verbose) {
      console.info(`start server on http://localhost:${argv.port}`);
    }
    //serve(argv.port);
  })
  //
  .command(
    'about', 'Dislay project information',
    (yargs) => {
    },
    async (argv) => {
      console.log(String.raw`  _____           _           _     _______    _             `);
      console.log(String.raw` |  __ \         (_)         | |   |__   __|  | |            `);
      console.log(String.raw` | |__) | __ ___  _  ___  ___| |_     | | __ _| | __ _ _ __  `);
      console.log(String.raw` |  ___/ '__/ _ \| |/ _ \/ __| __|    | |/ _' | |/ _' | '_ \ `);
      console.log(String.raw` | |   | | | (_) | |  __/ (__| |_     | | (_| | | (_| | | | |`);
      console.log(String.raw` |_|   |_|  \___/| |\___|\___|\__|    |_|\__,_|_|\__,_|_| |_|`);
      console.log(String.raw`                _/ |                                         `);
      console.log(String.raw`               |__/                                          `);
      console.log(String.raw`    ______ ___  ___               _____             _        `);
      console.log(String.raw`    | ___ \|  \/  |              /  __ \           | |       `);
      console.log(String.raw`    | |_/ /| .  . |   __ _  ___  | /  \/  ___    __| |  ___  `);
      console.log(String.raw`    |  __/ | |\/| |  / _' |/ __| | |     / _ \  / _' | / _ \ `);
      console.log(String.raw`    | |    | |  | | | (_| |\__ \ | \__/\| (_) || (_| ||  __/ `);
      console.log(String.raw`    \_|    \_|  |_/  \__,_||___/  \____/ \___/  \__,_| \___| `);
      console.log();
      console.log(String.raw`  version : ${require('./package.json').version}             `);
      console.log(String.raw`   author : vladislav.kurmaz@gmail.com                       `);
      console.log(String.raw`     site : https://umlhub.io                                `);
      console.log(String.raw`   github : https://github.com/project-talan/tln-pm.git      `);
      console.log();
    }
  )
  .parse();


      