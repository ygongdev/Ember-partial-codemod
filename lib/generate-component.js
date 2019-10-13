const fs = require("fs");

function generateComponent({attributes, actions, partials} = {attributes: [], actions: [], partials: []}) {
  if (actions.length <= 0) {
    return undefined;
  }

  const importCode = "import Component from '@ember/component';\nimport { tryInvoke } from '@ember/utils';\n\n";

  // let documentation = "/**\n\tATTRIBUTES\n";
  // attributes.forEach(attr => documentation += `\t${attr}=${attr}\n`);
  // // documentation +=`\n\tActions\n`;
  // actions.forEach(action => documentation += `\t${action}=(action "${action})"\n`);
  // documentation += "**/\n";

  let componentCode = "export default Component.extend({\n";
  if (actions.length > 0) {
    let actionsCode = "\tactions: {\n";
    actions.forEach(action => {
      actionsCode +=
        `\t\t${action}() {\n` +
        `\t\t\ttryInvoke(this, '${action}');\n` +
        "\t\t},\n";
    });
    actionsCode += "\t}\n";
    componentCode += actionsCode;
  }
  componentCode += "});\n";

  // const content = importCode + documentation + componentCode;
  const content = importCode + componentCode;
  return content;
}

module.exports = {
  generateComponent,
};

