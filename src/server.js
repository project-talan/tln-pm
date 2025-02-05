'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const express = require('express');
var cors = require('cors')
const fg = require('fast-glob');

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
    ea.use(express.static(path.join(__dirname, '..', 'web')));
    // ea.use(express.static(path.join(__dirname, '..', 'app', 'dist')));

    // API
    ea.get('/info', (req, res) => {
      res.send(this.makeResponce({version}));
    })
    ea.get('/projects', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { project: true } })));
    })
    ea.get('/teams', async (req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { team: true } })));
    })
    ea.get(['/tasks', '/tasks/:component*'], async(req, res) => {
      const component = req.params.component ? `${req.params.component}${req.params[0]}` : null;
      const tasks = await app.ls({
        component,
        depth: 10,
        who: { assignees: [], all: true },
        filter: { tag: [], search: [], deadline: [], status: { 
          todo: req.query.todo === 'true' ? true : false,
          dev: req.query.dev === 'true' ? true : false,
          blocked: req.query.blocked === 'true' ? true : false,
          done: req.query.done === 'true' ? true : false,
        }}
      });
      res.send(this.makeResponce(tasks, tasks ? null : `Component ${req.params.component} not found`));
    })
    ea.get('/srs', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { srs: true } })));
    })

    ea.get('/raw', (req, res) => {
      const arr = [];
      const dump = (node, indent) => {
        arr.push(`${indent}${node.id?node.id:'/'}`);
        node.children.map(c => dump(c, `${indent}&nbsp;&nbsp;`));
      }
      dump(root, '');
      //this.logger.con(arr);
      res.send(arr.join('<br/>'));
    })
    
    ea.listen(port, () => {
      this.logger.con(`start server version ${version} on http://localhost:${port} in ${readOnly?'read-only':'read-write'} mode`);
    })

  }
 
}

module.exports.create = (logger) => {
  return new Server(logger);
}
