const chai = require('chai');

const docsFactory = require('./docs');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Docs entity', function () {

  it('can be created', function () {
    expect(docsFactory.create(logger)).not.to.be.null;
  });

});