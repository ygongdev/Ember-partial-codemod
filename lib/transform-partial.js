const chalk = require("chalk");
const { transform } = require("ember-template-recast");
const DELIMITERS = require("../lib/constant/delimiters");

function _buildHashPairs(attrs, b) {
  const pairs = [];

  attrs.attributes.forEach(attr => {
    pairs.push(b.pair(attr, b.path(attr)));
  });

  attrs.actions.forEach(action => {
    pairs.push(b.pair(action, b.path(action)));
  });

  return pairs;
}

function transformPartial(template, attributesMap, { replaceDelimiter = false } = {}) {
  const { code } = transform(template, env => {
    let { builders: b } = env.syntax;

    return {
      MustacheStatement(node) {
        if (node.path.original === "partial" && node.params && node.params.length > 0  && node.params[0].type === "StringLiteral") {
          const value = node.params[0].value;
          if (value in attributesMap) {
            let moduleName = value;
            const attributes = attributesMap[value];
            console.info(chalk.green(`Recasting ${value}`));
            if (replaceDelimiter) {
              DELIMITERS.forEach(delim =>
                moduleName = moduleName.replace(delim, replaceDelimiter)
              );
            }
            return b.mustache(b.path(moduleName), [], b.hash(_buildHashPairs(attributes, b)));
          }
        }
      },
    };
  });
  return code;
}

module.exports = {
  transformPartial,
};
