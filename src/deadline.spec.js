const chai = require('chai');

const deadlineFactory = require('./deadline');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Deadline entity', function () {

  it('can be created', function () {
    expect(deadlineFactory.create(logger)).not.to.be.null;
  });

});