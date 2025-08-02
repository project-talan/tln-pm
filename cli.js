#!/usr/bin/env node
'use strict';

const defaultFileName = '.tpm.conf';
const defaultPort = 5445;

const fs = require('fs');

const findUp = require('find-up')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const yaml = require('js-yaml');
const { table, getBorderCharacters } = require('table');
const chalk = require('chalk');

const loggerFactory = require('./src/logger');
const appFactory = require('./src/app');


const getApp = async (argv, load, fn) => {
  const verbose = argv.verbose;
  const include = argv.include.split(';');
  const ignore = argv.ignore.split(';');
  //
  // console.time('get app');
  // console.time('create logger');
  const logger = loggerFactory.create(verbose);
  // console.timeEnd('create logger');
  // console.time('create app');
  const a = appFactory.create(logger);
  // console.timeEnd('create app');
  //a.logger.con(argv);
  // console.time('init app');
  await a.init();
  // console.timeEnd('init app');
  // console.time('load app');
  if (load) {
    await a.load(include, ignore);
  }
  // console.timeEnd('load app');
  await fn(a);
  // console.timeEnd('get app');
}

const configPath = findUp.sync(['.tpmrc']);
yargs(hideBin(process.argv))
  .help('help').alias('help', 'h')
  .config(configPath ? JSON.parse(fs.readFileSync(configPath)) : {})
  .usage('Project management as Code\nUsage:\n $0 <command> [options]')
  .option('verbose', { alias: 'v', count: true, default: 0 })
  .option('include', { default: '**/.tpm.conf', type: 'string' })
  .option('ignore', { default: '**/node_modules', type: 'string' })
  .option('depth', { describe: 'Scan depth', default: 5, type: 'number' })
  .option('g', { describe: 'Assignee(s), if not defined git user email will be used', alias: 'assignee', default: [], type: 'array' })
  .option('t', { describe: 'Filter output using tag value', alias: 'tag', default: [], type: 'array' })
  .option('s', { describe: 'String to search', alias: 'search', default: [], type: 'array' })
  .option('d', { describe: 'Deadline', alias: 'deadline', default: [], type: 'array' })
  .option('a', { describe: 'Show for all team members', alias: 'all', default: false, type: 'boolean' })
  .option('r', { describe: 'Execute command recursively', alias: 'recursively', default: false, type: 'boolean' })

  .option('file', { describe: 'File name', default: '.tpm.conf', type: 'string' })

  .option('backlog', { describe: 'Show tasks in backelog (-,>,!)', default: false, type: 'boolean' })
  .option('todo', { describe: 'Tasks in todo state (-)', default: false, type: 'boolean' })
  .option('dev', { describe: 'Tasks in dev state (>)', default: false, type: 'boolean' })
  .option('blocked', { describe: 'Tasks in blocked state (!)', default: false, type: 'boolean' })
  .option('done', { describe: 'Tasks in done state (+)', default: false, type: 'boolean' })

  .option('project', { describe: 'Include project section', default: false, type: 'boolean' })
  .option('team', { describe: 'Include team section', default: false, type: 'boolean' })
  .option('timeline', { describe: 'Include timeline section', default: false, type: 'boolean' })
  .option('tasks', { describe: 'Include tasks section', default: true, type: 'boolean' })
  .option('docs', { describe: 'Include documentation section', default: false, type: 'boolean' })
  .option('components', { describe: 'Include Components section', default: false, type: 'boolean' })

  .option('deadlines', { describe: 'Deadline for tasks spill over <from>:<to>', default: null, type: 'string' })
  .option('save', { describe: 'Save modifications', default: false, type: 'boolean' })
  .option('force', { describe: 'Force command execution', default: false, type: 'boolean' })
  .option('json', { describe: 'Output in json format', default: false, type: 'boolean' })
  .option('yaml', { describe: 'Output in yaml format', default: false, type: 'boolean' })
  .option('hierarchy', { describe: 'Output nested components as hierarchy', default: false, type: 'boolean' })
  // 
  // ls command aims to work exclusively with tasks
  .command('ls [component]', 'Show list of tasks', (yargs) => {
    return yargs
    .positional('component', {
      describe: 'Nested component to show',
      default: null
    });
  }, async (argv) => {
    if (argv.verbose > 0) {
      console.time('ls');
    }
    await getApp(argv, true, async (a) => {
      // console.time('app callback');
      // console.log(argv);
      a.logger.info('component:', argv.component);
      const defaultStatus = !(argv.backlog || argv.todo || argv.dev || argv.blocked || argv.done);
      const component = await a.ls({
        component: argv.component,
        depth: argv.depth,
        who: { assignees: argv.assignee, all: argv.all },
        filter: {
          tag: argv.tag,
          search: argv.search,
          deadline: argv.deadline,
          status: {
            todo: argv.todo || argv.backlog,
            dev: argv.dev || argv.backlog || defaultStatus,
            blocked: argv.blocked || argv.backlog,
            done: argv.done
          }
        }
      });
      // console.timeEnd('component ls');
      //
      // console.time('print');
      const prefix = "";
      const hierarchy = argv.hierarchy;
      if (component) {
        if (argv.json || argv.yaml) {
          if (argv.json) {
            a.logger.con(JSON.stringify(component));
          } else {
            a.logger.con(yaml.dump(component, {lineWidth: -1}));
          }
        } else {
          const dumpComponent = (c, indent, last) => {
            if (c.tasks.length || ( c.components.length && hierarchy)) {
              if (hierarchy) {
                a.logger.con(`${indent}${last?'└':'├'} ${c.id}`);
              } else {
                a.logger.con(``);
                a.logger.con(`~ ${c.relativePath}`);
              }
              //
              const dumpTask = (t, indent) => {
                if (t.title) {
                  const g = t.assignees.length ? ` @(${t.assignees.join(',')})` : '';
                  const tg = t.tags.length ? ` #(${t.tags.join(',')})` : '';
                  const dl = t.deadline ? ` (${t.deadline})` : '';
                  const id = t.id ? ` ${t.id}:` : '';
                  a.logger.con(`${indent}${t.status}${id} ${t.title}${g}${tg}${dl}`);
                  // sub tasks
                  for (const st of t.tasks) {
                    dumpTask(st, `${indent}  `);
                  }
                }
              }
              const ti = hierarchy ? `${indent}${last?' ':'|'} * ` : '  ';
              for (const t of c.tasks) {
                dumpTask(t, ti);
              }
            }
            //
            // nested components
            c.components.sort((a, b) => a.relativePath < b.relativePath ? -1 : 1);
            for (let i = 0; i < c.components.length; i++) {
              dumpComponent(c.components[i], `${indent}${last?' ':'|'} `, i === c.components.length - 1);
            }
          }
          dumpComponent(component, '', true);
        }
      }
      // console.timeEnd('print');
      // console.timeEnd('app callback');
    });
    if (argv.verbose > 0) {
      console.timeEnd('ls');
    }
  })
  //
  .command('config', 'Generate .tpm.conf skeleton', (yargs) => {
    return yargs
  }, async (argv) => {
    // console.log(argv);
    await getApp(argv, false, async (a) => {
      await a.config({
        what: {
          project: argv.project || argv.all,
          team: argv.team || argv.all,
          timeline: argv.timeline || argv.all,
          tasks: argv.tasks || argv.all,
          docs: argv.docs || argv.all
        },
        file: argv.file,
        force: argv.force
      });
    });
  })
  //
  .command('describe [component] [id]', 'Describe component or task', (yargs) => {
    return yargs
    .positional('component', {
      describe: 'Nested component to show',
      default: null
    })
    .positional('id', {
      describe: 'Optional entity id',
      default: null
    });
  }, async (argv) => {
    await getApp(argv, true, async (a) => {
      // console.log(argv);
      const r = await a.describe({
        component: argv.component,
        id: argv.id,
        what: { component: true },
      });
      if (argv.json || argv.yaml) {
        if (argv.json) {
          a.logger.con(JSON.stringify(r));
        } else {
          a.logger.con(yaml.dump(r, {lineWidth: -1}));
        }
      } else {
        a.logger.con(r);
      }
    });
  })
  //
  .command('update [component] [id]', 'Update task', (yargs) => {
    return yargs;
  }, async (argv) => {
    await getApp(argv, true, async (a) => {
      // console.log(argv);
      const ids = argv.id ? argv.id.split(':') : [];
      const sources = await a.update({
        component: argv.component,
        ids,
        status: { todo: argv.todo, dev: argv.dev, blocked: argv.blocked, done: argv.done },
        recursively: argv.recursively,
      });
      //
      [...new Set(sources)].forEach(async (s) => {
        await s.save();
        a.logger.info(`Updated: ${s.file}`);
      });
    });
  })
  //
  .command('normalise [component] [id] [--save]', 'Normalise task status', (yargs) => {
    return yargs;
  }, async (argv) => {
    await getApp(argv, true, async (a) => {
      // console.log(argv);
      await a.normalise({
        component: argv.component,
        id: argv.id,
        save: argv.save
      });
    });
  })
  //
  .command('spillover [component] [id] [--save]', 'Spill over task(s)',
    (yargs) => {
      return yargs;
    },
    async (argv) => {
      await getApp(argv, true, async (a) => {
        try {
        // console.log(argv);
          const [from, to] = argv.deadlines.split(':');
          if (!from || !to) {
            throw new Error('Invalid deadlines format');
          }
          await a.spillOver({
            component: argv.component,
            id: argv.id,
            from,
            to,
            save: argv.save
          });
        } catch (e) {
          a.logger.error('Provide option in format "--deadlines from:to" for spill over');
        }
      });
    }
  )
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
      .positional('port',   { describe: 'Port to bind on', default: defaultPort })
      .option('read-only',  { describe: 'Readonly serve mode, no modifications are allowed', default: true, type: 'boolean' })
      .option('watch',      { describe: 'Automatically reload configurations one files were changed', default: false, type: 'boolean' })
      ;
  }, (argv) => {
    getApp(argv, true, async (a) => {
      a.serve({
        port: argv.port,
        readOnly: argv.readOnly,
        watch: argv.watch,
        glob: argv.file,
      });
    });
  })
  .command('audit', 'Audit project', (yargs) => {
    return yargs;
  }, async (argv) => {
    await getApp(argv, true, async (a) => {

const data = [
  ['SpheraX audit report', '', ''],
  ['Area', 'Feature', 'Details'],
  ['Timeline', 'Current release', chalk.white.bgBlue('spherax-25.7.3')],
  ['', 'Scheduled releases', '4'],
  ['', 'Delivered releases', '4'],
  ['Team', 'Active members', '5'],
  ['', 'Total members', '10'],
  ['Tasks', 'Without assignee', '0'],
  ['', 'Without estimate', '1'],
  ['', 'Without deadline', '5'],
  ['', 'Release deficit', '5'],



  /*
  ['Subtotal', '', '150'],
  ['Team', 'User', '24'],
  ['', 'Payment', '30'],
  ['Taks', '', '54'],
  ['Total', '', '204'],
  */
];

const config = {
  columns: [
    { alignment: 'left', width: 12 },
    { alignment: 'left', width: 32 },
    { alignment: 'right', width: 44 },
  ],
  spanningCells: [
    { col: 0, row: 0, colSpan: 3 },
    { col: 0, row: 2, rowSpan: 3, verticalAlignment: 'top'},
    { col: 0, row: 5, rowSpan: 2, verticalAlignment: 'top'},
    { col: 0, row: 7, rowSpan: 4, verticalAlignment: 'top'},
    /*
    { col: 0, row: 4, colSpan: 3, alignment: 'right'},
    { col: 0, row: 5, rowSpan: 2, verticalAlignment: 'middle'},
    { col: 0, row: 7, colSpan: 2, alignment: 'right' },
    { col: 0, row: 8, colSpan: 2, alignment: 'right' }
     */
  ],
  border: getBorderCharacters('norc'),

};

console.log(table(data, config));

    });
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


      