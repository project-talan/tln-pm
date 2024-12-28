const chai = require('chai');

const componentFactory = require('./component');

const { expect } = chai;

const logger = require('./logger').create(0);

const home = '/tmp';

describe('Component entity', function () {

  it('can be created', function () {
    expect(componentFactory.create(logger, home, null)).not.to.be.null;
  });

});