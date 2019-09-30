'use strict';

const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');
const { getAttributes } = require('../../src/get-attributes');
const expectedAttributes = require('../fixtures/attributes/attributes.json');

describe('get-attribute', function() {
  it('generates correct attributes and actions', function(done) {
    const sourceDir = path.resolve('./test/fixtures/attributes', 'partial.hbs');
    const source = fs.readFileSync(sourceDir).toString();

    const attrs = getAttributes(source);

    const attributesMatch = !attrs.attributes.some(attr => !expectedAttributes.attributes.includes(attr));
    const actionsMatch = !attrs.actions.some(action => !expectedAttributes.actions.includes(action));

    expect(attributesMatch).to.be.true;
    expect(actionsMatch).to.be.true;
    done();
  });

  it('ignores block params', function(done) {
    const sourceDir = path.resolve('./test/fixtures/attributes', 'partial-with-block-params.hbs');
    const source = fs.readFileSync(sourceDir).toString();

    const attrs = getAttributes(source);

    const attributesMatch = !attrs.attributes.some(attr => !expectedAttributes.attributes.includes(attr));
    const actionsMatch = !attrs.actions.some(action => !expectedAttributes.actions.includes(action));

    expect(attributesMatch).to.be.true;
    expect(actionsMatch).to.be.true;
    done();
  });
});