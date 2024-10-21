const chai = require('chai');

const srsFactory = require('./srs');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('SRS entity', function () {

  it('can be created', function () {
    expect(srsFactory.create(logger)).not.to.be.null;
  });

});