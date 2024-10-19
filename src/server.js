'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const express = require('express');
const fg = require('fast-glob');
const yaml = require('js-yaml');


const utils = require('./utils');

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

  async serve(root, options) {
    const {port, readOnly} = options;
    //
    const getLocalContent = (file) => {
      return fs.readFileSync(path.join(__dirname, '..', 'web', file), {encoding: 'utf8'});
    }
    //
    const app = express();
    app.get('/', (req, res) => {
      res.send(getLocalContent('index.html'));
    })
    app.get('/styles.css', (req, res) => {
      res.send(getLocalContent('styles.css'));
    })
    app.get('/main.js', (req, res) => {
      res.send(getLocalContent('main.js'));
    })
    app.get('/team', (req, res) => {
      res.send(this.makeResponce(root.getTeam({}, true, true)));
    })

    app.get('/raw', (req, res) => {
      const arr = [];
      const dump = (node, indent) => {
        arr.push(`${indent}${node.id?node.id:'/'}`);
        node.children.map(c => dump(c, `${indent}&nbsp;&nbsp;`));
      }
      dump(root, '');
      //this.logger.con(arr);
      res.send(arr.join('<br/>'));
    })
    
    app.listen(port, () => {
      this.logger.con(`start server on http://localhost:${port} in ${readOnly?'read-only':'read-write'} mode`);
    })

  }
 
}

module.exports.create = (logger) => {
  return new Server(logger);
}
