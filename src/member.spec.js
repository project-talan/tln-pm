const chai = require('chai');

const memberFactory = require('./member');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Member entity', function () {

  it('can be created', function () {
    expect(memberFactory.create(logger)).not.to.be.null;
  });

});