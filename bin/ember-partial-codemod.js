#!/usr/bin/env node
const argv = require('yargs').argv;
const { getAttributes } = require('../src/get-attributes');
const { generateComponent } = require('../src/generate-component');

function run() {
  const { input, output } = argv;

  if (input && output) {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(path.join(__dirname, input)).toString();

    generateComponent(getAttributes(source), path.join(__dirname, output));
  } else {
    console.log('Invalid');
  }
}

run();