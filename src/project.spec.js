const chai = require('chai');

const projectFactory = require('./project');

const { expect } = chai;

const logger = require('./logger').create(0);

const project1Desc = {
  id: 'project1',
  name: 'Project1',
  description: 'My Project1'
};

class SourceMock {
  constructor(id) {
    this.id = id;
  }
  isItMe(source) {
    return (this.id === source.id);
  }
}

describe('Project entity', function () {

  it('can be created', function () {
    expect(projectFactory.create(logger, {})).not.to.be.null;
  });

  it('can load description', async function () {
    const sourceMock1 = new SourceMock('source1');
    const project1 = projectFactory.create(logger, sourceMock1);

    await project1.load(project1Desc);

    const project1Summary = await project1.getSummary();
    expect(project1Summary).to.deep.equal(project1Desc);
  });

  it('can be reconstructed', async function () {
    const sourceMock1 = new SourceMock('source1');
    const sourceMock2 = new SourceMock('source2');

    const project1 = projectFactory.create(logger, sourceMock1);

    await project1.load(project1Desc);

    const project1Reconstruct1 = await project1.reconstruct(sourceMock1);
    expect(project1Reconstruct1).to.deep.equal(project1Desc);

    const project1Reconstruct2 = await project1.reconstruct(sourceMock2);
    expect(project1Reconstruct2).to.be.undefined;
  });


});