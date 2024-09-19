#!/usr/bin/env node
'use strict';

const defaultFileName = '.tpm.yml';
const defaultPort = 5445;

const path = require('path');
const fs = require('fs');
const exec = require('child_process').execSync;

const findUp = require('find-up')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const { option } = require('yargs');

const getApp = async (options, fn) => {
  const {assignees, include, ignore} = options;
  const a = require('./src/app').create();
  await a.init(assignees, include, ignore);
  await fn(a);
}

const configPath = findUp.sync(['.tpmrc']);
yargs(hideBin(process.argv))
  .help('help').alias('help', 'h')
  .config(configPath ? JSON.parse(fs.readFileSync(configPath)) : {})
  .usage('Project management as Code\nUsage:\n $0 <command> [options]')
  .option('verbose', { alias: 'v', count: true, default: 0 })
  .option('include', { default: '**/.todo', type: 'string' })
  .option('ignore', { default: '**/node_modules', type: 'string' })
  .option('d', { describe: 'Scan depth', alias: 'depth', default: 5, type: 'string' })
  .option('g', { describe: 'Assignee(s), if not defined git user email will be used', alias: 'assignee', default: [], type: 'array' })
  .option('s', { describe: 'String to search', alias: 'search', default: null, type: 'string' })
  .option('a', { describe: 'Show all elements', alias: 'all', default: false, type: 'boolean' })
  .option('done', { describe: 'Show done tasks too', default: false, type: 'boolean' })
  .option('team', { describe: 'Include team section', default: false, type: 'boolean' })
  .option('timeline', { describe: 'Include timeline section', default: false, type: 'boolean' })
  .option('tasks', { describe: 'Include tasks section', default: true, type: 'boolean' })
  .option('srs', { describe: 'Include SRS section', default: true, false: 'boolean' })
  .option('force', { describe: 'Force command execution', default: true, false: 'boolean' })
  .option('hierarchy', { describe: 'Output nested components as hierarchy', default: false, type: 'boolean' })
  // 
  .command('ls [--team] [--timeline] [--tasks] [--srs] [-g assignee]', 'Show list of tasks', (yargs) => {
    return yargs
  }, async (argv) => {
    getApp({assignees: argv.assignee, include: argv.include.split(';'), ignore: argv.ignore.split(';')}, async (a) => {
      //console.log(argv);
      await a.ls({
        depth: argv.depth,
        search: argv.search || [],
        team: argv.team,
        timeline: argv.timeline,
        tasks: argv.tasks,
        srs: argv.srs,
        all: argv.all,
        done: argv.done,
        hierarchy: argv.hierarchy
      });
    });
  })
  //
  .command('save', 'Store current status in the file', (yargs) => {
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


      