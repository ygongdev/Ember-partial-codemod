#!/usr/bin/env node
const yargs = require("yargs");
const fs = require("fs");
const fse = require("fs-extra");

const { transformPartial } = require("../lib/transform-partial");
const { gatherPartialInfo } = require("../lib/gather-partial-info");
const { generateComponent } = require("../lib/generate-component");

/**
 * 1. Recast: go through each `partial parent`, and use  `partialModuleNameAttributeMap` to transform any `partials`.
 * 2. Generate component `.js` file, if needed, e.g `actions`.
 */
function run() {
  const argv = yargs
    .alias("v", "verbose")
    .alias("t", "transform")
    .alias("crr", "component-replace")
    .alias("rd", "replace-delimiter")
    .boolean("verbose")
    .choices("replace-delimiter", ["$", "::", "@"])
    .argv;
  const { transform: customTransform, replaceDelimiter, verbose, componentReplace } = argv;

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
      const componentPhysicalDiskPath = componentReplace ? partialParentsPhysicalDiskPath.replace(crr) : partialParentsPhysicalDiskPath.replace("/templates/", "/");
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