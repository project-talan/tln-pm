'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const chokidar = require('chokidar');
const express = require('express');
var cors = require('cors')
const fg = require('fast-glob');
const ems = require('enhanced-ms');

const utils = require('./utils');
const {version} = require('../package.json');

class Server {

  /*
  *
  * params:
  */
  constructor(logger) {
    this.logger = logger;
  }

  makeResponce(data, error = null) {
    if (error) return { success: false, error };
    return {success: true, data };
  }

  async serve(app, root, options) {
    const {port, readOnly, watch, glob} = options;
    //
    // watch file system changes
    if (watch) {
      console.log(`tpm will be watching file system for changes in ${glob} files recursively`);
      const watcher = chokidar.watch(app.entries, {
        persistent: true
      });
      // Add event listeners
      watcher
      .on('change', path => {
        console.log(`File ${path} has been changed, reloading ...`);
        app.reload();
      })
    }
    //
    const ea = express();
    ea.use(cors());
    ea.use(express.static(path.join(__dirname, '..', 'app', 'dist')));
    // ea.use(express.static(process.cwd()));
    // console.log('process.cwd:', process.cwd());

    // API
    ea.get('/api/info', (req, res) => {
      res.send(this.makeResponce({version, scmUser: app.scmUser}));
    })
    ea.get('/api/projects', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { component: true } })));
    })
    ea.get(['/api/tasks', '/api/tasks/:component*'], async(req, res) => {
      // console.log('req.params:', req.params);
      // console.log('req.query:', req.query);
      const component = req.params.component ? `${req.params.component}${req.params[0]}` : null;
      const status = {todo: false, dev: false, blocked: false, done: false};
      if (req.query.status) {
        req.query.status.split(',').forEach((s) => {
          status[s] = true;
        });
      }
      const assignees = req.query.assignees ? req.query.assignees.split(',') : [];
      const tags = req.query.tags ? req.query.tags.split(',') : [];
      //
      // console.log('component:', component);
      // console.log('status:', status);
      // console.log('assignees:', assignees);
      // console.log('tags:', tags);
      const tasks = await app.ls({
        component,
        depth: 10,
        who: { assignees, all: !assignees.length },
        filter: { tag: tags, search: [], deadline: [], status },
      });
      // console.log('tasks:', tasks);
      if (tasks) {
        utils.timelineTasks(tasks, [], [], ems('8h'));
      }
      res.send(this.makeResponce(tasks, tasks ? null : `Component ${req.params.component} not found`));
    })
    // DOCS
    ea.get('/api/docs', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { docs: true } })));
    })
    // ASSESSMENTS
    ea.get('/api/assessments', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { assessments: true } })));
    })
    //
    // SPA
    ea.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'app', 'dist', 'index.html'));
    });
    //    
    const server = ea.listen(port, () => {
      this.logger.con(`start server version ${version} on http://localhost:${port} in ${readOnly?'read-only':'read-write'} mode`);
    })
    //
    // Graceful shutdown function
    const shutdown = () => {
      console.log('Received kill signal, shutting down gracefully...');

      // Stop the server from accepting new connections
      server.close((err) => {
        if (err) {
          console.error('Error closing server:', err);
          process.exit(1);
        }

        console.log('Server closed successfully.');
        // Perform any async cleanup tasks here, if needed
        process.exit(0);
      });

      // If server.close takes longer than 5 seconds, forcefully exit
      setTimeout(() => {
        console.error('Forcing server shutdown after 5 seconds...');
        process.exit(1);
      }, 5000);
    };
    // Listen for termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}

module.exports.create = (logger) => {
  return new Server(logger);
}

/*
    ea.get('/api/team', async (req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { team: true } })));
    })
    ea.get('/api/timeline', async (req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { timeline: true } })));
    })

*/