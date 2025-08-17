const chai = require('chai');

const refsFactory = require('./refs');

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

describe('Refs entity', function () {

  it('can be created', function () {
    expect(teamFactory.create(logger)).not.to.be.null;
  });

  it('can be loaded', async function () {
    const source = new SourceMock('test');
    const refs = refsFactory.create(logger, source);
    await refs.load(['src', 'app']); 
    expect(refs.refs.length).to.equal(2);
    expect(refs.refs[0].id).to.equal('ref1');
    expect(refs.refs[1].id).to.equal('ref2');
  });
});