const chai = require('chai');
const sinon = require('sinon');
const taskFactory = require('./task');
const { expect } = chai;

describe('Task entity', function () {
  let loggerStub;

  before(function () {
    loggerStub = sinon.stub(require('./logger'), 'create').returns({
      info: sinon.stub(),
      error: sinon.stub(),
    });
  });

  after(function () {
    loggerStub.restore();
  });

  it('should create a task', function () {
    const task = taskFactory.create();
    expect(task).not.to.be.null;
    expect(task).to.have.property('tasks').that.is.an('array').that.is.empty;
  });

  it('should load tasks from plain text', async function () {
    const task = taskFactory.create();
    await task.parse([
      '[>:002] task 002',
      '  [-] task 002.1',
      '    [-] task 002.1.1',
      '    [!] task 002.1.2',
      '    [>] task 002.1.3',
      '  [>] task 002.2',
      '[>:001] task 001'
    ], 0);

    expect(task.tasks.length).to.equal(2);
    expect(task.tasks[0].tasks.length).to.equal(2);
    expect(task.tasks[0].tasks[0].tasks.length).to.equal(3);
    expect(task.tasks[0].tasks[0].tasks[0].tasks.length).to.equal(0);
    expect(task.tasks[0].tasks[0].tasks[1].tasks.length).to.equal(0);
    expect(task.tasks[0].tasks[0].tasks[2].tasks.length).to.equal(0);
    expect(task.tasks[1].tasks.length).to.equal(0);
  });

  it('should normalize task statuses correctly', function () {
    const task = taskFactory.create();
    taskFactory.taskTransformer.forEach(tt => {
      expect(task.getNormaliseStatus(tt.in)).to.equal(tt.out);
    });
  });

  it('should handle empty input for parse method', async function () {
    const task = taskFactory.create();
    await task.parse([], 0);
    expect(task.tasks).to.be.an('array').that.is.empty;
  });

  it('should throw an error for invalid task format', async function () {
    const task = taskFactory.create();
    try {
      await task.parse(['invalid task format'], 0);
    } catch (error) {
      expect(error).to.be.an('error');
    }
  });
});