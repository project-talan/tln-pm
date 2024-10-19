const chai = require('chai');

const taskFactory = require('./task');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Task entity', function () {

  it('can be created', function () {
    expect(taskFactory.create()).not.to.be.null;
  });

});