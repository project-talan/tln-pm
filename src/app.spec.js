const chai = require('chai');

const appFactory = require('./app');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Source entity', function () {

  it('can be created', function () {
    expect(appFactory.create(logger)).not.to.be.null;
  });

});