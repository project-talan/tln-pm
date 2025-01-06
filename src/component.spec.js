const chai = require('chai');
const componentFactory = require('./component');
const { expect } = chai;
const logger = require('./logger').create(0);
const home = '/tmp';

describe('Component entity', function () {
  it('can be created', function () {
    expect(componentFactory.create(logger, home, null)).not.to.be.null;
  });

  it('should have a logger instance', function () {
    const component = componentFactory.create(logger, home, null);
    expect(component.logger).to.exist;
    expect(component.logger).to.equal(logger);
  });

  it('should have a home directory', function () {
    const component = componentFactory.create(logger, home, null);
    expect(component.home).to.exist;
    expect(component.home).to.equal(home);
  });
});