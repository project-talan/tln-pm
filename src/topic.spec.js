const chai = require('chai');

const topicFactory = require('./topic');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Topic entity', function () {

  it('can be created', function () {
    expect(topicFactory.create(logger)).not.to.be.null;
  });

});