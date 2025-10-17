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
    // PROJECTS
    ea.get('/api/projects', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { component: true } })));
    })
    /*
    ea.get('/api/projects2', async(req, res) => {
      res.send(this.makeResponce( await app.describe({ what: { component: true } })));
      const data = {
        "projects": [
          {
            "id": "tln-pm",
            "name": "Talan PM",
            "description": "Project Management as Code",
            "path": "",
            "lastCommit": "2025-09-17 18:20:33 +0300",
            "lastUpdateTime": "24d",
            "team": [
              {
                "id": "vlad.k",
                "name": "Vladyslav Kurmaz",
                "involvements": [
                  {
                    "project": "tln-pm",
                    "email": "vladislav.kurmaz@gmail.com"
                  },
                  {
                    "project": "tln-cli",
                    "email": "vladislav.kurmaz@gmail.com"
                  }
                ],
                "stats": {
                  "todo": 36,
                  "dev": 1,
                  "blocked": 0,
                  "done": 68,
                  "total": 105
                }
              }
            ],
                "timeline": [
                    {
                        "id": "0.24.0",
                        "uid": "tln-pm@0.24.0",
                        "date": "2025-11-05T16:00:00.000Z",
                        "active": true,
                        "current": false,
                        "durationToRelease": 2151881670,
                        "durationToReleaseHR": "24d"
                    },
                    {
                        "id": "0.23.0",
                        "uid": "tln-pm@0.23.0",
                        "date": "2025-10-18T16:00:00.000Z",
                        "active": true,
                        "current": true,
                        "durationToRelease": 596681670,
                        "durationToReleaseHR": "6d"
                    },
                    {
                        "id": "0.22.0",
                        "uid": "tln-pm-0.22.0",
                        "date": "2025-09-17T18:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.21.0",
                        "uid": "tln-pm-0.21.0",
                        "date": "2025-08-04T05:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.20.0",
                        "uid": "tln-pm-0.20.0",
                        "date": "2025-06-27T08:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.19.0",
                        "uid": "tln-pm-0.19.0",
                        "date": "2025-04-26T21:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.18.0",
                        "uid": "tln-pm-0.18.0",
                        "date": "2025-03-30T12:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.17.0",
                        "uid": "tln-pm-0.17.0",
                        "date": "2025-03-16T12:40:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.16.0",
                        "uid": "tln-pm-0.16.0",
                        "date": "2025-03-01T21:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.15.0",
                        "uid": "tln-pm-0.15.0",
                        "date": "2025-02-19T10:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.14.0",
                        "uid": "tln-pm-0.14.0",
                        "date": "2025-01-10T18:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.13.0",
                        "uid": "tln-pm-0.13.0",
                        "date": "2024-12-30T14:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.12.0",
                        "uid": "tln-pm-0.12.0",
                        "date": "2024-12-21T19:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.11.0",
                        "uid": "tln-pm-0.11.0",
                        "date": "2024-12-09T08:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.10.0",
                        "uid": "tln-pm-0.10.0",
                        "date": "2024-11-17T21:40:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.9.0",
                        "uid": "tln-pm-0.9.0",
                        "date": "2024-11-10T21:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.8.0",
                        "uid": "tln-pm-0.8.0",
                        "date": "2024-11-03T12:00:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.7.0",
                        "uid": "tln-pm-0.7.0",
                        "date": "2024-10-28T21:55:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.6.0",
                        "uid": "tln-pm-0.6.0",
                        "date": "2024-10-22T15:30:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.5.0",
                        "uid": "tln-pm-0.5.0",
                        "date": "2024-09-23T15:30:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.4.0",
                        "uid": "tln-pm-0.4.0",
                        "date": "2024-09-15T15:30:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.3.0",
                        "uid": "tln-pm-0.3.0",
                        "date": "2024-09-12T15:30:00.000Z",
                        "active": false,
                        "current": false
                    },
                    {
                        "id": "0.2.0",
                        "uid": "tln-pm-0.2.0",
                        "date": "2024-09-04T15:30:00.000Z",
                        "active": false,
                        "current": false
                    }
                ],
                "assessment": {
                    "nfr": [
                        {
                            "id": "io.umlhub.nfr.recoverability",
                            "name": "Recoverability",
                            "value": 0.88
                        },
                        {
                            "id": "io.umlhub.nfr.verifiability",
                            "name": "Verifiability",
                            "value": 0.16
                        },
                        {
                            "id": "io.umlhub.nfr.functionality",
                            "name": "Functionality",
                            "value": 0.54
                        }
                    ]
                },
                "summary": {
                    "release": {
                        "id": "0.23.0",
                        "uid": "tln-pm-0.23.0",
                        "date": "2025-10-18T16:00:00.000Z",
                        "active": true,
                        "current": true,
                        "durationToRelease": 596681670,
                        "durationToReleaseHR": "6d",
                        "features": 1,
                        "improvements": 1
                    },
                    "team": {
                        "size": 0,
                        "total": 1,
                        "utilization": [
                            0.6,
                            0.82,
                            0.08,
                            0.25,
                            0,
                            0.95,
                            0.63,
                            0.47,
                            0.63,
                            0.88
                        ]
                    },
                    "tasks": {
                        "todo": 36,
                        "dev": 1,
                        "blocked": 0,
                        "done": 68
                    }
                }
            }
        ],
        "team": [
            {
                "id": "vlad.k",
                "name": "Vladyslav Kurmaz",
                "bandwidth": [
                    {
                        "project": "tln-pm",
                        "email": "vladislav.kurmaz@gmail.com"
                    }
                ],
                "status": {
                    "todo": 36,
                    "dev": 1,
                    "blocked": 0,
                    "done": 68,
                    "total": 105
                }
            }
        ],
        "timeline": [],
        "stats": {
          "todo": 36,
          "dev": 1,
          "blocked": 0,
          "done": 68,
          "total": 105
        }
    }
}

    })
*/
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