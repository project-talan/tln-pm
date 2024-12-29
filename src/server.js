'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const express = require('express');
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
    const getLocalContent = (file) => {
      return fs.readFileSync(path.join(__dirname, '..', 'web', file), {encoding: 'utf8'});
    }
    //
    const ea = express();
    ea.use(express.static(path.join(__dirname, '..', 'web')));

    // ea.get('/', (req, res) => {
    //   res.send(getLocalContent('index.html'));
    // })
    // ea.get('/styles.css', (req, res) => {
    //   res.send(getLocalContent('styles.css'));
    // })
    // ea.get('/main.js', (req, res) => {
    //   res.send(getLocalContent('main.js'));
    // })
    // API
    ea.get('/info', (req, res) => {
      res.send(this.makeResponce({version}));
    })
    ea.get('/projects', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { project: true } })));
    })
    ea.get('/team', async (req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { team: true } })));
    })
    ea.get('/tasks', async(req, res) => {
      res.send(this.makeResponce( await app.ls({
        component: null,
        depth: 10,
        who: { assignees: [], all: true },
        filter: { tag: [], search: [], deadline: [], status: { todo: true, dev: true, tbd: true, blocked: true, done: true, dropped: true } }
      })));
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
