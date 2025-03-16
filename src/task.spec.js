const chai = require('chai');
const sinon = require('sinon');
const taskFactory = require('./task');
const { expect } = chai;

const logger = require('./logger').create(0);

class SourceMock {
  constructor(id) {
    this.id = id;
  }
  isItMe(source) {
    return (this.id === source.id);
  }
}

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

  it('find task by id', async function () {
    const task = taskFactory.create(loggerStub);
    await task.parse([
      '[>:002] task 002',
      '  [-] task 002.1',
      '    [-] task 002.1.1',
      '    [!] task 002.1.2',
      '    [>] task 002.1.3',
      '  [>] task 002.2',
      '[>:001] task 001'
    ], 0);
    const t1 = await task.find("002");
    expect(t1).to.have.property('id').that.is.equal("002");

    const t2 = await task.find("003");
    expect(t2).to.be.undefined;
  });

  it('find task by array of id', async function () {
    const task = taskFactory.create();
    task.id = '000';
    await task.parse([
      '[>:002] task 002',
      '  [-] task 002.1',
      '    [-] task 002.1.1',
      '    [!] task 002.1.2',
      '    [>] task 002.1.3',
      '  [>] task 002.2',
      '[>:001] task 001'
    ], 0);
    const t1 = await task.findByIds("000/002/1".split('/'));
    expect(t1).to.have.property('index').that.is.equal(1);

    const t2 = await task.findByIds("000/002/3".split('/'));
    expect(t2).to.be.undefined;
  });

  it('task hierarch can be normalised', async function () {
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
  });

  it('can be reconstructed', async function () {
    const sourceMock1 = new SourceMock('source1');
    const sourceMock2 = new SourceMock('source2');

    const task1 = taskFactory.create(loggerStub, sourceMock1);
    await task1.parse([
      '[>:002] task 002 @vlad.k #16h',
      '  [-] task 002.1',
      '    [-] task 002.1.1',
      '    [!] task 002.1.2',
      '    [>] task 002.1.3',
      '  [>] task 002.2',
      '[>:001] task 001'
    ], 0);
    const task1Reconstruct1Result = [                                                                                     
      '[] ',
      '  [>:002] task 002 #16h @vlad.k',
      '    [-] task 002.1',
      '      [-] task 002.1.1',
      '      [!] task 002.1.2',                                                                                                                                                  
      '      [>] task 002.1.3',                                                                                                                                                  
      '    [>] task 002.2',                                                                                                                                                      
      '  [>:001] task 001'                                                                
    ];

    const task1Reconstruct1 = await task1.reconstruct(sourceMock1);
    expect(task1Reconstruct1).to.deep.equal(task1Reconstruct1Result);

  });

});



