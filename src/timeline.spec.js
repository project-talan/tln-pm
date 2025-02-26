const chai = require('chai');

const timelineFactory = require('./timeline');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Timeline entity', function () {

  it('can be created', function () {
    expect(timelineFactory.create(logger)).not.to.be.null;
  });

});