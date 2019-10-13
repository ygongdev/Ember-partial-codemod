const chalk = require("chalk");
const { transform } = require("ember-template-recast");

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

function customPartialTransform(template, attributesMap) {
  const { code } = transform(template, env => {
    let { builders: b } = env.syntax;

    return {
      MustacheStatement(node) {
        if (node.path.original === "partial" && node.params && node.params.length > 0  && node.params[0].type === "StringLiteral") {
          const value = node.params[0].value;
          if (value in attributesMap) {
            const attributes = attributesMap[value];
            console.info(chalk.green(`Recasting ${value}`));
            // Only difference is that we replace convert to sigil.
            return b.mustache(b.path(value.replace('@', '$').replace('::', '$')), [], b.hash(_buildHashPairs(attributes, b)));
          }
        }
      },
    };
  });
  return code;
}

module.exports = customPartialTransform;
