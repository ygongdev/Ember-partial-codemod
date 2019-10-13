#!/usr/bin/env node
const yargs = require("yargs");
const fs = require("fs");
const fse = require("fs-extra");

const { transformPartial } = require("../lib/transform-partial");
const { gatherPartialInfo } = require("../lib/gather-partial-info");
const { generateComponent } = require("../lib/generate-component");
const DELIMITERS = require("../lib/constant/delimiters");

/**
 * 1. Recast: go through each `partial parent`, and use  `partialModuleNameAttributeMap` to transform any `partials`.
 * 2. Generate component `.js` file, if needed, e.g `actions`.
 */
function run() {
  const argv = yargs
    .help("help")
    .alias("h", "help")
    .options({
      verbose: {
        alias: "verb",
        description: "Display useful information while running codemod",
        type: "boolean"
      },
      transform: {
        alias: "t",
        description: "Custom transform module for recasting",
        type: "string"
      },
      componentReplaceRegex: {
        alias: "crr",
        description: "Regex to convert template to component path",
        type: "string"
      },
      replaceDelimiter: {
        alias: "rd",
        description: `Replace module name [${DELIMITERS}] while recasting`,
        type: "string"
      }
    })
    .boolean("verbose")
    .choices("replace-delimiter", ["$", "::", "@"])
    .argv;
  const { transform: customTransform, replaceDelimiter, verbose, componentReplaceRegex } = argv;

  if (!verbose) {
    console.info = () => {};
  }

  const transform = customTransform ? require(customTransform) : transformPartial;

  const {
    partialParentsPhysicalDiskPaths,
    partialModuleNameAttributeMap
  } = gatherPartialInfo();

  for (let i = 0; i < partialParentsPhysicalDiskPaths.length; i++) {
    const partialParentsPhysicalDiskPath = partialParentsPhysicalDiskPaths[i];

    const template = fs.readFileSync(partialParentsPhysicalDiskPath).toString();
    const { code: newTemplate, attributes: attrs } = transform(template, partialModuleNameAttributeMap, { replaceDelimiter });
    if (newTemplate && (template !== newTemplate)) {
      let componentPhysicalDiskPath = partialParentsPhysicalDiskPath;
      if (componentReplaceRegex) {
        componentPhysicalDiskPath = componentPhysicalDiskPath.replace(componentReplaceRegex);
      } else if (componentPhysicalDiskPath.includes("/components/")) {
        componentPhysicalDiskPath = componentPhysicalDiskPath.replace("/templates/", "/");
      } else {
        componentPhysicalDiskPath = componentPhysicalDiskPath.replace("/templates/", "/components/");
      }
      const component = generateComponent(attrs);
      // If the component file does not exist and we need to create one, we create one.
      if (!fs.existsSync(componentPhysicalDiskPath) && component) {
        fse.outputFileSync(componentPhysicalDiskPath.replace(".hbs", ".js"), component);
      }
      fs.writeFileSync(partialParentsPhysicalDiskPath, newTemplate);
    }
  }
}

run();