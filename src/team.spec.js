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
    fte: 1.5
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
    fte: 0.5
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
    fte: 1
  }
]

const sourceMock = {
  isItMe: () => true
}

describe('Team entity', function () {

  it('can be created', function () {
    expect(teamFactory.create(logger)).not.to.be.null;
  });

  it('can load members', async function () {
    const team1 = teamFactory.create(logger);
    await team1.load(team1Members);
    const members = await team1.getSummary();
    expect(members).to.have.length(2);
  });

  it('can be reconstructed', async function () {
    const team1 = teamFactory.create(logger, sourceMock);
    await team1.load(team1Members);
    const team = await team1.reconstruct(sourceMock);
    expect(team).to.deep.equal(team1Members);
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

});