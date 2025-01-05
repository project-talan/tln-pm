const chai = require('chai');

const utils = require('./utils');

const { expect } = chai;

const emptyTask = {status: '-', id: '', title: '', deadline: '', assignees: [], tags: [], links: []};

describe('Utils lib', function () {

  it('should parse empty string', function () {
    expect(utils.parseTask('')).to.be.eql(emptyTask);
  });

  it('should skip description with leading spaces', function () {
    expect(utils.parseTask(' [>]')).to.be.eql(emptyTask);
  });

  it('should skip empty description', function () {
    expect(utils.parseTask('[] Task')).to.be.eql(emptyTask);
    expect(utils.parseTask('[::] Task')).to.be.eql(emptyTask);
    expect(utils.parseTask('[:001] Task')).to.be.eql(emptyTask);
    expect(utils.parseTask('[:001:v24.9.0] Task')).to.be.eql(emptyTask);
  });

  it('should capture status', function () {
    expect(utils.parseTask('[-] Task')).to.be.eql({...emptyTask, status: '-', title: 'Task'});
    expect(utils.parseTask('[>] Task')).to.be.eql({...emptyTask, status: '>', title: 'Task'});
    expect(utils.parseTask('[!] Task')).to.be.eql({...emptyTask, status: '!', title: 'Task'});
    expect(utils.parseTask('[+] Task')).to.be.eql({...emptyTask, status: '+', title: 'Task'});
  });

  it('should capture id', function () {
    expect(utils.parseTask('[-:001] Task')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task'});
   // expect(utils.parseTask('[:001:v24.9.0] Task')).to.be.eql({...emptyTask, status: '-', id: '001', deadline: 'v24.9.0'});
  });

  it('should capture deadline', function () {
    expect(utils.parseTask('[-:001:v24.9.0] Task')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', deadline: 'v24.9.0'});
  });

  it('should capture assignee(s)', function () {
    expect(utils.parseTask('[-:001:v24.9.0] Task @vlad.k')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', deadline: 'v24.9.0', assignees: ['vlad.k']});
  });

  it('should capture tag(s)', function () {
    expect(utils.parseTask('[-:001:v24.9.0] Task #backend #highest')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', deadline: 'v24.9.0', assignees: [], tags: ['backend', 'highest']});
  });
 });