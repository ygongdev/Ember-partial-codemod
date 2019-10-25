const fs = require("fs");

function generateComponent({attributes, actions, partials} = {attributes: [], actions: [], partials: []}) {
  if (actions.length <= 0) {
    return undefined;
  }

  const importCode = "import Component from '@ember/component';\nimport { tryInvoke } from '@ember/utils';\n\n";

  let componentCode = "export default Component.extend({\n";
  if (actions.length > 0) {
    let actionsCode = "\tactions: {\n";
    actions.forEach(action => {
      actionsCode +=
        `\t\t${action}() {\n` +
        `\t\t\ttryInvoke(this, '${action}', [...arguments]);\n` +
        "\t\t},\n";
    });
    actionsCode += "\t}\n";
    componentCode += actionsCode;
  }
  componentCode += "});\n";

  const content = importCode + componentCode;
  return content;
}

module.exports = {
  generateComponent,
};

