const chalk = require("chalk");
const { transform } = require("ember-template-recast");
const DELIMITERS = [
  "@", "$", "::"
]

function _buildHashPairs(attrs, b) {
  const pairs = [];

  // Turn the component into a truly tagless template
  pairs.push(b.pair("tagName", b.literal("StringLiteral", "")));

  // Builds attr=attr
  attrs.attributes.forEach(attr => {
    pairs.push(b.pair(attr, b.path(attr)));
  });

  // Builds action2=(action "action2")
  attrs.actions.forEach(action2 => {
    pairs.push(b.pair(action2, b.sexpr(b.path("action"), [b.literal("StringLiteral", action2)])));
  });

  return pairs;
}

function customPartialTransform(template, attributesMap, partialModuleUsed, { replace, replaceDelimiter }) {
  let attributes = {};
  const { code } = transform(template, env => {
    let { builders: b } = env.syntax;

    return {
      MustacheStatement(node) {
        if (node.path.original === "partial" && node.params && node.params.length > 0  && node.params[0].type === "StringLiteral") {
          const value = node.params[0].value;
          if (value in attributesMap) {
            partialModuleUsed.add(value);
            let moduleName = value;
            attributes = attributesMap[value];
            console.info(chalk.green(`Recasting ${value}`));
            if (replaceDelimiter) {
              DELIMITERS.forEach(delim =>
                moduleName = moduleName.replace(delim, replaceDelimiter)
              );
            }
            if (replace) {
              moduleName = moduleName.replace(replace[0], replace[1]);
            }
            return b.mustache(b.path(value.replace('@', '$').replace('::', '$')), [], b.hash(_buildHashPairs(attributes, b)));
          }
        }
      },
    };
  });

  return {
    code,
    attributes
  };
}

module.exports = customPartialTransform;
