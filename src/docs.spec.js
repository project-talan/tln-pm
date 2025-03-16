const chai = require('chai');
const sinon = require('sinon');

const docsFactory = require('./docs');

const { expect } = chai;

class SourceMock {
  constructor(id) {
    this.id = id;
  }
  isItMe(source) {
    return (this.id === source.id);
  }

  getFolder() {
    return 'folder';
  }
}


describe('Docs entity', function () {
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

  it('can be created', function () {
    expect(docsFactory.create(loggerStub)).not.to.be.null;
  });

    it('can load topics', async function () {
      const sourceMock1 = new SourceMock('source1');

      const doc1 = docsFactory.create(loggerStub, sourceMock1);
      await doc1.load({topic1: '#Topic1', topic2: '#Topic2'});
 
    });
  


});