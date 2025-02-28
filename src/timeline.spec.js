const chai = require('chai');

const timelineFactory = require('./timeline');

const { expect } = chai;

const logger = require('./logger').create(0);

const now = new Date('2024-02-27T18:00:00.000Z');

const timeline1Desc = {
  "0.16.0": {
    deadline: "2024-04-01T00:00:00.000Z"
  },
  "0.15.0": {
    deadline: "2024-03-01T00:00:00.000Z"
  },
  "0.14.0": {
    deadline: "2024-01-01T00:00:00.000Z"
  }
}

const timeline1Summary = [
  {
    id: '0.16.0',
    uid: "project1-0.16.0",
    date: '2024-04-01T00:00:00.000Z',
    active: true,
    current: false,
    durationToRelease: 2872800000,
    durationToReleaseHR: '1mo'
  },
  {
    id: '0.15.0',
    uid: "project1-0.15.0",
    date: '2024-03-01T00:00:00.000Z',
    active: true,
    current: true,
    durationToRelease: 194400000,
    durationToReleaseHR: '2d'
  },
  {
    id: '0.14.0',
    uid: "project1-0.14.0",
    date: '2024-01-01T00:00:00.000Z',
    active: false,
    current: false
  }
];

class SourceMock {
  constructor(id) {
    this.id = id;
  }
  isItMe(source) {
    return (this.id === source.id);
  }
}

describe('Timeline entity', function () {

  it('can be created', function () {
    expect(timelineFactory.create(logger)).not.to.be.null;
  });

  it('can load deadlines', async function () {

    const timeline1 = timelineFactory.create(logger);
    await timeline1.load(timeline1Desc, 'project1', now);

    const summary1 = await timeline1.getSummary();
    expect(summary1).to.deep.equal(timeline1Summary);
  });

  it('can be reconstructed', async function () {
    const sourceMock1 = new SourceMock('source1');
    const sourceMock2 = new SourceMock('source2');

    const timeline1 = timelineFactory.create(logger, sourceMock1);
    await timeline1.load(timeline1Desc, 'project1', now);

    const tl11 = await timeline1.reconstruct(sourceMock1);
    expect(tl11).to.deep.equal(timeline1Desc);

    const tl12 = await timeline1.reconstruct(sourceMock2);
    expect(tl12).to.be.undefined;

    const timeline2 = timelineFactory.create(logger, sourceMock2);
    await timeline2.load(null, 'project2', now);

    const tl21 = await timeline2.reconstruct(sourceMock2);
    expect(tl21).to.be.undefined;

  });

  it('can find closest deadline', async function () {
    const sourceMock1 = new SourceMock('source1');
    const sourceMock2 = new SourceMock('source2');

    const timeline1 = timelineFactory.create(logger, sourceMock1);
    await timeline1.load(timeline1Desc, 'project1', now);

    const closest1 = await timeline1.getClosestRelease();
    expect(closest1).to.deep.equal(timeline1Summary[1]);
  });


});