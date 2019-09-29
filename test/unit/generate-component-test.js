'use strict';

const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');
const Attributes = require('../fixtures/attributes/attributes.json');
const { generateComponent } = require('../../src/generate-component');

describe('get-attribute', function() {
  it('generates correct component content', function(done) {
    const componentContent = generateComponent(Attributes);
    const expectedComponentPath = path.resolve('./test/fixtures/attributes', 'component.js');
    const expectedComponentContent = fs.readFileSync(expectedComponentPath).toString();
    expect(componentContent).to.be.equal(expectedComponentContent);

    done();
  });
});