#!/usr/bin/env node
const argv = require("yargs").argv;
const fs = require("fs");
const path = require("path");
const { getAttributes } = require("../src/get-attributes");
const { generateComponent } = require("../src/generate-component");

function run() {
  let { input, output } = argv;

  if (!input) {
    const args = process.argv.slice(2);
    [input, output] = args;
  }

  if (input) {
    if (input.substr(-4) !== ".hbs") {
      console.error("input file is not a Handlebars template.");
      process.exit(1);
    }
    const inputPath = path.resolve(input);
    const source = fs.readFileSync(inputPath).toString();
    const component = generateComponent(getAttributes(source));

    let outputPath;
    if (output) {
      if (output.substr(-3) !== ".js") {
        console.error("output file is not a Javascript file.");
        process.exit(1);
      }
      outputPath = path.resolve(output);
    } else {
      outputPath = path.resolve(input.replace(".hbs", ".js"));
      console.log(`No output defined, writing to "${outputPath}"...`);
    }

    fs.writeFileSync(outputPath, component);
  }
}

run();