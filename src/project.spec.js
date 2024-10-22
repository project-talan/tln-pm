const chai = require('chai');

const projectFactory = require('./project');

const { expect } = chai;

const logger = require('./logger').create(0);

describe('Project entity', function () {

  it('can be created', function () {
    expect(projectFactory.create(logger, {})).not.to.be.null;
  });

});