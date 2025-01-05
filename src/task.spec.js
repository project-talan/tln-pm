const chai = require('chai');

const taskFactory = require('./task');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Task entity', function () {

  it('can be created', function () {
    expect(taskFactory.create()).not.to.be.null;
  });

  it('can be load tasks from plain text', async function () {
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
    expect(task.tasks.length).to.be.equal(2);
    expect(task.tasks[0].tasks.length).to.be.equal(2);
    expect(task.tasks[0].tasks[0].tasks.length).to.be.equal(3);
    expect(task.tasks[0].tasks[0].tasks[0].tasks.length).to.be.equal(0);
    expect(task.tasks[0].tasks[0].tasks[1].tasks.length).to.be.equal(0);
    expect(task.tasks[0].tasks[0].tasks[2].tasks.length).to.be.equal(0);
    expect(task.tasks[1].tasks.length).to.be.equal(0);
  });

  it('can be normalised', function () {
    const task = taskFactory.create();
    taskFactory.taskTransformer.forEach( tt => {
      expect(task.getNormaliseStatus(tt.in)).to.be.equal(tt.out);
    });
  });

});