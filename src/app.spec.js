const chai = require('chai');

const sourceFactory = require('./source');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Source entity', function () {

  it('can be created', function () {
    expect(sourceFactory.create(logger)).not.to.be.null;
  });

});