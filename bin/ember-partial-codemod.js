#!/usr/bin/env node
const yargs = require("yargs");
const fs = require("fs");
const fse = require("fs-extra");

const { transformPartial, transformPartialTemplate } = require("../lib/transform-partial");
const { gatherPartialInfo } = require("../lib/gather-partial-info");
const { getAttributes } = require("../lib/get-attributes");
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
      attr: {
        description: "Gets the attribute of an file",
        type: "string",
      },
      patterns: {
        alias: "pat",
        description: "Expand specific directories while globbing",
        type: "array",
      },
      verbose: {
        alias: "verb",
        description: "Display useful information while running codemod",
        type: "boolean"
      },
      customCwd: {
        alias: "cwd",
        description: "Setting the cwd for searching",
        type: "string",
      },
      transform: {
        alias: "t",
        description: "Custom transform module for recasting",
        type: "string"
      },
      replaceDelimiter: {
        alias: "rd",
        description: `Replace module name [${DELIMITERS}] while recasting`,
        type: "string"
      },
      replace: {
        alias: "r",
        description: "Replace certain names in template and component paths. 2 params",
        type: "array"
      }
    })
    .choices("replace-delimiter", ["$", "::", "@"])
    .argv;
  let { transform: customTransform, replaceDelimiter, verbose, customCwd,  attr, patterns, replace } = argv;
  replaceDelimiter = replaceDelimiter ? replaceDelimiter : "$";

  if (!verbose) {
    console.info = () => {};
  }

  if (attr) {
    const attributes = getAttributes(fs.readFileSync(attr).toString());
    console.info(attributes);
    return;
  }

  const transform = customTransform ? require(customTransform) : transformPartial;

  const globConfig = {};
  globConfig.absolute = true;
  if (customCwd) {
    globConfig.cwd = customCwd;
  }
  globConfig.expandDirectories = true;
  globConfig.gitignore = true;

  const {
    partialParentsPhysicalDiskPaths,
    partialModuleNameAttributeMap,
    partialModuleNameToPhysicalDiskPath,
  } = gatherPartialInfo(patterns, { globConfig });

  const partialModulesUsed = new Set();
  /**
   * Recasting and building components
   * 1. Iterate through all parents of partials
   * 2. Recast if a new template is generated
   */
  for (let i = 0; i < partialParentsPhysicalDiskPaths.length; i++) {
    const partialParentsPhysicalDiskPath = partialParentsPhysicalDiskPaths[i];

    const template = fs.readFileSync(partialParentsPhysicalDiskPath).toString();
    const { code: newTemplate, attributes: attrs } = transform(template, partialModuleNameAttributeMap, partialModulesUsed, { replace, replaceDelimiter });
    if (newTemplate && (template !== newTemplate)) {

      fse.outputFileSync(partialParentsPhysicalDiskPath, newTemplate);

      if (replace && partialParentsPhysicalDiskPath.includes(replace[0])) {
        console.info(`Moving partials: ${partialParentsPhysicalDiskPath}`);
        // If the path does not contain /components we replace /templates/ into /templates/components/
        let newPath = partialParentsPhysicalDiskPath.replace(replace[0], replace[1]);
        if (!partialParentsPhysicalDiskPath.includes("/components/")) {
          newPath = newPath.replace("/templates/", "/templates/components/");
        }
        fse.moveSync(partialParentsPhysicalDiskPath, newPath);
      }
    }
  }

  partialModulesUsed.forEach(usedModule => {
    const physicalDiskPath = partialModuleNameToPhysicalDiskPath[usedModule];

    if (physicalDiskPath && fse.existsSync(physicalDiskPath)) {
      const template = fs.readFileSync(partialModuleNameToPhysicalDiskPath[usedModule]).toString();
      const { code: newTemplate } = transformPartialTemplate(template);
      if (newTemplate && (template !== newTemplate)) {
        console.info(`Recasting partial template: ${physicalDiskPath}`);
        fse.outputFileSync(physicalDiskPath, newTemplate);
      }

      let newPath = physicalDiskPath;

      if (replace && physicalDiskPath.includes(replace[0])) {
        newPath = newPath.replace(replace[0], replace[1]);
      }
      // If the path does not contain /components we replace /templates/ into /templates/components/
      if (!physicalDiskPath.includes("/components/")) {
        newPath = newPath.replace("/templates/", "/templates/components/");
      }
      console.info(`Moving leaf partials: ${physicalDiskPath} to ${newPath}`);

      fse.moveSync(physicalDiskPath, newPath);
    }
  });
}

run();