const chai = require('chai');
const appFactory = require('./app');
const { expect } = chai;
const logger = require('./logger').create(0);

describe('Source entity', function () {
  it('can be created', function () {
    const app = appFactory.create(logger);
    expect(app).not.to.be.null;
    expect(app).to.be.an('object');
  });

  it('should have a logger instance', function () {
    const app = appFactory.create(logger);
    expect(app.logger).to.exist;
    expect(app.logger).to.equal(logger);
  });

  it('should throw an error if logger is not provided', function () {
    expect(() => appFactory.create()).to.throw(Error, 'Logger is required');
  });
});