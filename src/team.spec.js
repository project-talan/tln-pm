const chai = require('chai');

const teamFactory = require('./team');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Team entity', function () {

  it('can be created', function () {
    expect(teamFactory.create(logger)).not.to.be.null;
  });

});