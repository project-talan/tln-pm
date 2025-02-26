'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

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
    const {port, readOnly} = options;
    //
    const ea = express();
    ea.use(cors());
    //ea.use(express.static(path.join(__dirname, '..', 'web')));
    ea.use(express.static(path.join(__dirname, '..', 'app', 'dist')));

    // API
    ea.get('/api/info', (req, res) => {
      res.send(this.makeResponce({version}));
    })
    ea.get('/api/projects2', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { project2: true } })));
    })
    ea.get('/api/team', async (req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { team: true } })));
    })
    ea.get('/api/timeline', async (req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { timeline: true } })));
    })
    ea.get(['/api/tasks', '/api/tasks/:component*'], async(req, res) => {
      console.log('req.params:', req.params);
      console.log('req.query:', req.query);
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
      console.log('component:', component);
      console.log('status:', status);
      console.log('assignees:', assignees);
      console.log('tags:', tags);
      const tasks = await app.ls({
        component,
        depth: 10,
        who: { assignees, all: !assignees.length },
        filter: { tag: [], search: [], deadline: [], status },
      });
      if (tasks) {
        utils.timelineTasks(tasks, [], [], ems('8h'));
      }
      
      res.send(this.makeResponce(tasks, tasks ? null : `Component ${req.params.component} not found`));
    })
    ea.get('/api/docs', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { docs: true } })));
    })
    //
    ea.listen(port, () => {
      this.logger.con(`start server version ${version} on http://localhost:${port} in ${readOnly?'read-only':'read-write'} mode`);
    })

  }
 
}

module.exports.create = (logger) => {
  return new Server(logger);
}
