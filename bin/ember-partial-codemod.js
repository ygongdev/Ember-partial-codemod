#!/usr/bin/env node
const yargs = require("yargs");
const fs = require("fs");

const { transformPartial } = require("../lib/transform-partial");
const { gatherPartialInfo } = require("../lib/gather-partial-info");

/**
 * 1. Recast: go through each `partial parent`, and use  `partialModuleNameAttributeMap` to transform any `partials`.
 * 2. TODO: Generate component `.js` file, if needed, e.g `actions`?
 */
function run() {
  const argv = yargs
    .alias("v", "verbose")
    .alias("t", "transform")
    .boolean("verbose")
    .choices("replaceDelimiter", ["$", "::", "@"])
    .argv;
  const { transform: customTransform, replaceDelimiter, verbose } = argv;

  if (!verbose) {
    console.info = () => {};
  }

  const transform = customTransform ? require(customTransform) : transformPartial;

  const {
    partialParentsPhysicalDiskPaths,
    partialModuleNameAttributeMap
  } = gatherPartialInfo();

  for (let i = 0; i < partialParentsPhysicalDiskPaths.length; i++) {
    const partialParent = partialParentsPhysicalDiskPaths[i];

    const template = fs.readFileSync(partialParent).toString();
    const newTemplate = transform(template, partialModuleNameAttributeMap, { replaceDelimiter });
    if (template !== newTemplate) {
      fs.writeFileSync(partialParent, newTemplate);
    }
  }
}

run();