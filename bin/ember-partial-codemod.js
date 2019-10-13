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
    .choices("replace-delimiter", ["$", "::", "@"])
    .argv;
  const { transform: customTransform, replaceDelimiter, verbose, customCwd, componentReplaceRegex } = argv;

  if (!verbose) {
    console.info = () => {};
  }

  const transform = customTransform ? require(customTransform) : transformPartial;

  const globConfig = {};
  globConfig.absolute = true;
  if (customCwd) {
    globConfig.cwd = customCwd;
  }

  const {
    templateAttributeMap,
    partialParentsPhysicalDiskPaths,
    partialModuleNameAttributeMap,
    partialModuleNameToPhysicalDiskPath,
  } = gatherPartialInfo({ globConfig });

  /**
   * Recasting and builindg components
   * 1. Iterate through all parents of partials
   * 2. Recast if a new template is generated
   * 3. Generate component if attributes exist
   */
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

  /**
   * There are cases where we also need to generate component for the LEAF partial itself, so the action gets registered. e.g
   * <button... action1=(action "action2")...>
   * We need to do this because up until this point, we have done it for all the PARENTS and if the LEAF template is a partial,
   * it most likely didn't have an associated component .js file once we remove it from the parent scope.
   *
   * Steps
   * 1. Iterate through `partialModuleNameToPhysicalDiskPath`'s physical disk path
   * 2. If component path, not the template path, does not exist, generate one since parent components have being generated already.
   * 3. This guarantees that we are creating it for the LEAF partials.
   */
  Object.values(partialModuleNameToPhysicalDiskPath).forEach(partialTemplatePhysicalDiskPath => {
    const partialComponentPhysicalDiskPath = partialTemplatePhysicalDiskPath.replace(".hbs", ".js");
    if (!fs.existsSync(partialComponentPhysicalDiskPath)) {
      const attrs = templateAttributeMap[partialTemplatePhysicalDiskPath];
      const component = generateComponent(attrs);
      if (component) {
        let componentPhysicalDiskPath = partialComponentPhysicalDiskPath;
        if (componentReplaceRegex) {
          componentPhysicalDiskPath = componentPhysicalDiskPath.replace(componentReplaceRegex);
        } else if (componentPhysicalDiskPath.includes("/components/")) {
          componentPhysicalDiskPath = componentPhysicalDiskPath.replace("/templates/", "/");
        } else {
          componentPhysicalDiskPath = componentPhysicalDiskPath.replace("/templates/", "/components/");
        }

        fse.outputFileSync(componentPhysicalDiskPath, component);
      }
    }
  });
}

run();