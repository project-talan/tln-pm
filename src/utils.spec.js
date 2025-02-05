const chai = require('chai');
const {parseTask, timelineTasks } = require('./utils');
const { expect } = chai;
const ems = require('enhanced-ms');

const emptyTask = {status: '-', id: '', title: '', estimate: 0, deadline: '', assignees: [], tags: [], links: []};

describe('Utils lib', function () {
  it('should parse empty string', function () {
    expect(parseTask('')).to.be.eql(emptyTask);
  });

  it('should skip description with leading spaces', function () {
    expect(parseTask(' [>]')).to.be.eql(emptyTask);
  });

  it('should skip empty description', function () {
    expect(parseTask('[] Task')).to.be.eql(emptyTask);
    expect(parseTask('[::] Task')). to.be.eql(emptyTask);
    expect(parseTask('[:001] Task')).to.be.eql(emptyTask);
    expect(parseTask('[:001:v24.9.0] Task')).to.be.eql(emptyTask);
  });

  it('should capture status', function () {
    expect(parseTask('[-] Task')).to.be.eql({...emptyTask, status: '-', title: 'Task'});
    expect(parseTask('[>] Task')).to.be.eql({...emptyTask, status: '>', title: 'Task'});
    expect(parseTask('[!] Task')).to.be.eql({...emptyTask, status: '!', title: 'Task'});
    expect(parseTask('[+] Task')).to.be.eql({...emptyTask, status: '+', title: 'Task'});
  });

  it('should capture id', function () {
    expect(parseTask('[-:001] Task')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task'});
  });

  it('should capture deadline', function () {
    expect(parseTask('[-:001:v24.9.0] Task')). to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', deadline: 'v24.9.0'});
  });

  it('should capture assignee(s)', function () {
    expect(parseTask('[-:001:v24.9.0] Task @vlad.k')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', deadline: 'v24.9.0', assignees: ['vlad.k']});
  });

  it('should capture tag(s)', function () {
    expect(parseTask('[-:001:v24.9.0] Task #backend #highest')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', deadline: 'v24.9.0', assignees: [], tags: ['backend', 'highest']});
  });

  it('should capture estimate', function () {
    const estimate = '4h';
    expect(parseTask(`[-:001:25.2.0] Task #backend #${estimate}`)).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', estimate: ems(estimate), deadline: '25.2.0', assignees: [], tags: ['backend', estimate]});
  });

  it('should put hierarchy of tasks on timeline', function () {
    const defaultEstimate = '4h';
    const team = [
      {"id":"alice.c","name":"Alice Clarke","bandwidth":[{"email":"alice.c@gmail.com","fte":1}]}
    ];
    const tasks = {
      "id":"test",
      "relativePath":"",
      "name":"My Project",
      "tasks":[
        {"status":">","id":"002","title":"Integrate auth library","estimate":72000000,"percentage":0,"deadline":"25.2.0","assignees":["alice.c"],"tags":[],"links":[],
          "tasks":[
            {"status":"!","id":"","title":"Add /iam/auth endpoint","estimate":57600000,"percentage":0,"deadline":"","assignees":[],"tags":["16h"],"links":[],"tasks":[]},
            {"status":">","id":"","title":"Configure auth callbacks","estimate":14400000,"percentage":0,"deadline":"","assignees":[],"tags":["4h"],"links":[],"tasks":[]}
          ]
        },
        {"status":"-","id":"001","title":"Create project structure","estimate":57600000,"percentage":0,"deadline":"25.2.0","assignees":["alice.c"],"tags":["16h"],"links":[],"tasks":[]}
      ],
      "components":[]
    };
    timelineTasks(team, tasks, ems(defaultEstimate));
    expect(tasks.estimate).to.be.eql(ems('36h'));
  });

  
});