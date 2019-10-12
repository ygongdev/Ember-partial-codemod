const glob = require("glob");
const fs = require("fs");
const chalk = require("chalk");

const { getTemplateLocation } = require("./get-template-location");
const { getAttributes } = require("./get-attributes");

/**
 * Gathers all the information on partials.
 *
 * @param {Object} param0 a configuration object, exposes `globConfig` for customizing `glob`.
 */
function gatherPartialInfo({ globConfig } = { globConfig: { absolute: true }}) {
  const globPattern = `**/addon/**/templates/**/*.hbs`;
  const templateLocations = glob.sync(globPattern, globConfig);

  // A mapping for path to attributes
  // e.g, { "foo/bar.hbs" : { attributes: ..., actions: ..., partials: ...}}
  const templateAttributeMap = {};
  // A mapping for parent to an array of its consuming parents.
  // e.g { "module partials" : "parent.hbs" }
  const partialModuleNameToParentMap = {};
  // e.g [ "foo/bar.hbs" ]
  const partialParentsPhysicalDiskPaths = [];
  // e.g { "module partial" : "foo/partial.hbs" }
  const partialModuleNameToPhysicalDiskPath = {};
  // e.g { "moduel partial" : { attributes: ..., actions: ..., partials: ...}}
  const partialModuleNameAttributeMap = {};

  /**
   * 1. Go through each `template` from `templateLocations`.
   * 2. Get the `attributes` from each `template`. Store this inside `templateAttributeMap`.
   * 3. If the `template` has `partials`, add the `template` as a parent of the `partial` in `partialModuleNameToParentMap`.
   * 4. Generate a mapping of `partial module name` to `physical disk path` via `get-template-location`, since `partial` will be in module name.
   */
  templateLocations.forEach(location => {
    const attributes = getAttributes(fs.readFileSync(location).toString());
    templateAttributeMap[location] = attributes;
    if (attributes.partials && attributes.partials.length > 0) {
      partialParentsPhysicalDiskPaths.push(location);
      attributes.partials.forEach(partial => {
        if (partial in partialModuleNameToParentMap) {
          partialModuleNameToParentMap[partial].add(location);
        } else {
          partialModuleNameToParentMap[partial] = (new Set()).add(location);
        }
      });
    }
  });

  let partialsFound = 0;
  for (const partial in partialModuleNameToParentMap) {
    const partialPhyscialDiskPath = getTemplateLocation(partial, { globConfig });
    if (partialPhyscialDiskPath) {
      partialModuleNameToPhysicalDiskPath[partial] = partialPhyscialDiskPath;
      partialsFound += 1;
    } else {
      console.log(chalk.red(`Failed to find template location for ${chalk.green(partial)}`));
    }
  }

  console.log(chalk.green(`Found template locations for ${partialsFound}/${Object.keys(partialModuleNameToParentMap).length} partials`));

  for (const partial in partialModuleNameToPhysicalDiskPath) {
    for (let i = 0; i < templateLocations.length; i++) {
      const template = templateLocations[i];
      if (partialModuleNameToPhysicalDiskPath[partial] === template) {
        partialModuleNameAttributeMap[partial] = templateAttributeMap[template];
        break;
      }
    }
  }

  return {
    partialParentsPhysicalDiskPaths,
    partialModuleNameAttributeMap,
  };
}

module.exports = {
  gatherPartialInfo
};