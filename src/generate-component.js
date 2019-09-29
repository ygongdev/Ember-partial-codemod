const fs = require('fs');

function generateComponent({attributes, actions}) {

  const importCode = `import Component from '@ember/component';\nimport { tryInvoke } from '@ember/utils';\n`;

  let documentation = `/**\n\tAttributes\n`;
  attributes.forEach(attr => documentation += `\t${attr}\n`);
  documentation +=`\n\tActions\n`;
  actions.forEach(action => documentation += `\t${action}\n`);
  documentation += `**/\n`;

  let componentCode = `export default Component.extend({\n`
  if (actions) {
    let actionsCode = `\tactions: {\n`;
    actions.forEach(action => {
      actionsCode +=
        `\t\t${action}() {\n` +
        `\t\t\ttryInvoke(this, '${action}');\n` +
        `\t\t},\n`
    })
    actionsCode += '\t}\n';
    componentCode += actionsCode;
  }
  componentCode += `});\n`

  const content = importCode + documentation + componentCode;
  return content;
}

module.exports = {
  generateComponent,
}

