const glob = require("glob");
const assert = require("assert");
const DELIMITERS = require("./constant/delimiters");

/**
 * TODO:
 * 1. improve accuracy and make it robust for other scenarios as well.
 * 2. Implement similar logic for `addon`.
 * 3. Allow setting `cwd` to something else other than `process.cwd()`
 *
 * @param {String} moduleName the name used inside the `template`
 * @param {Object} config an object containing some configurations.
 *
 * @example
 * getTemplateLocation(
 *  "foo@bar/baz",
 *  {
 *   currentAddonPath: "/Users/...foo/addon/templates/bar/baz.hbs",
 *   isApp: true
 *  }
 * )
 *
 */
function getTemplateLocation(moduleName, { currentAddonPath, globConfig, isApp = true } = {}) {
  if (isApp) {
    let splitModuleNames;
    // Break the module into parts by some delimiters
    // e.g foo::partials/bar = ["foo", "partials/bar"]
    for (let i = 0; i < DELIMITERS.length; i++) {
      splitModuleNames = moduleName.split(DELIMITERS[i]);
      if (splitModuleNames.length > 1) {
        // Assumption: there shouldn't be more than one unique delimiter, so split is done
        break;
      }
    }

    /**
     * If none of the delimiters were inside the module name, then the module must only have had `/` for its nested file system.
     * In this case, if `currentAddonPath` is passed in, we will use the `currentAddonPath` for faster glob lookup
     *
     * `Example`
     * If `currentAddonPath`: `A/B`/addon/templates/partials/C/D.hbs
     * we want to extract everything before `addon`, `A/B` to perform a faster glob.
     */
    if (currentAddonPath && splitModuleNames.length < 2) {
      const splitCurrentAddonPath = currentAddonPath.split("/");
      const idx = splitCurrentAddonPath.indexOf("addon");
      const currentAddonName = splitCurrentAddonPath.slice(0, idx - 1).join("/");
      // Adding the extracted addon name to splitModuleNames for easier processing
      splitModuleNames.unshift(currentAddonName);
    }
    // Assumption, there should always be at most 1 delimiter in the module name...
    // so `splitModuleNames` should never have length longer than 2...
    assert(splitModuleNames.length <= 2, "Something went wrong while splitting module name. Please check that your module name is correct");

    let globPattern = `**/${splitModuleNames[0]}/**/${splitModuleNames[1]}.hbs`;
    // console.info(`Finding using the following glob pattern, ${globPattern}...`);
    let templateLocations = glob.sync(globPattern, globConfig);
    // TODO: What to do if somehow we found more than one matching locations?
    if (templateLocations.length <= 0) {
      // Sometimes the previous glob is too defined, broaden the scope.
      globPattern = `**/${splitModuleNames[1]}.hbs`;
      // console.info(`Trying again using the another glob pattern, ${globPattern}...`);
      templateLocations = glob.sync(globPattern, globConfig);
    }
    assert("Found multiple template locations", templateLocations.length <= 1);
    return templateLocations[0];
  }
}

module.exports = {
  getTemplateLocation
};
