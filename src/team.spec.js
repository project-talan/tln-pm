const chai = require('chai');

const teamFactory = require('./team');

const { expect } = chai;

const logger = require('./logger').create(0);

const team1Members = {
  "alice.c": {
    email: "alice.c@gmail.com",
    name: "Alice Clarke",
    fte: 1
  },
  "bob.w": {
    email: "bob.w@gmail.com",
    name: "Bob Walts",
    fte: 0.5
  }
}

const team2Members = {
  "carol.l": {
    email: "alice.c@gmail.com",
    name: "Carol Lewit",
    fte: 1
  },
  "alice.c": {
    email: "alice.c@gmail.com",
    name: "Alice Clarke",
    fte: 0.5
  },
}

const mergedMembers = [
  {
    id: "alice.c",
    name: "Alice Clarke",
    bandwidth: [
      {
        project: 'project1',
        email: "alice.c@gmail.com",
        fte: 1
      },
      {
        project: 'project2',
        email: "alice.c@gmail.com",
        fte: 0.5
      }
    ],
    fte: 1.5,
    status: {
      todo: 0,
      dev: 0,
      blocked: 0,
      done: 0,
      total: 0
    }
  },
  {
    id: "bob.w",
    name: "Bob Walts",
    bandwidth: [
      {
        project: 'project1',
        email: "bob.w@gmail.com",
        fte: 0.5
      }
    ],
    fte: 0.5,
    status: {
      todo: 0,
      dev: 0,
      blocked: 0,
      done: 0,
      total: 0
    }
  },
  {
    id: "carol.l",
    name: "Carol Lewit",
    bandwidth: [
      {
        project: 'project2',
        email: "alice.c@gmail.com",
        fte: 1
      }
    ],
    fte: 1,
    status: {
      todo: 0,
      dev: 0,
      blocked: 0,
      done: 0,
      total: 0
    }
  }
]

class SourceMock {
  constructor(id) {
    this.id = id;
  }
  isItMe(source) {
    return (this.id === source.id);
  }
}

describe('Team entity', function () {

  it('can be created', function () {
    expect(teamFactory.create(logger)).not.to.be.null;
  });

  it('can load members', async function () {
    const team1 = teamFactory.create(logger);
    await team1.load(team1Members);
    const members1 = await team1.getSummary();
    expect(members1).to.have.length(2);
    //
    const team2 = teamFactory.create(logger);
    await team2.load();
    const members2 = await team2.getSummary();
    expect(members2).to.have.length(0);
  });

  it('can be reconstructed', async function () {
    const sourceMock1 = new SourceMock('source1');
    const sourceMock2 = new SourceMock('source2');
    //
    const team1 = teamFactory.create(logger, sourceMock1);
    await team1.load(team1Members);

    const t11 = await team1.reconstruct(sourceMock1);
    expect(t11).to.deep.equal(team1Members);

    const t12 = await team1.reconstruct(sourceMock2);
    expect(t12).to.be.undefined;
    //
    const team2 = teamFactory.create(logger, sourceMock1);
    const t21 = await team2.reconstruct(sourceMock1);
    expect(t21).to.be.undefined;

    const t22 = await team1.reconstruct(sourceMock2);
    expect(t22).to.be.undefined;

  });

  it('can be merged', async function () {
    const team1 = teamFactory.create(logger);
    const team2 = teamFactory.create(logger);

    await team1.load(team1Members, 'project1');
    await team2.load(team2Members, 'project2');

    let team = await team1.merge([]);
    team = await team2.merge(team);
    expect(team).to.deep.equal(mergedMembers);
  });

  it('can be found by email', async function () {
    const team1 = teamFactory.create(logger);

    await team1.load(team1Members, 'project1');

    const id1 = await team1.getIdByEmail('alice.c@gmail.com');
    const id2 = await team1.getIdByEmail('alice1.c@gmail.com');
    expect(id1).to.equal('alice.c');
    expect(id2).to.be.null;
  });

});