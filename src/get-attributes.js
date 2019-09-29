/**
  Glimmer VM Node AST
  Program: Program;
  Template: Template;
  Block: Block;
  CommentStatement: CommentStatement;
  MustacheCommentStatement: MustacheCommentStatement;
  TextNode: TextNode;
  PathExpression: PathExpression;
  StringLiteral: StringLiteral;
  BooleanLiteral: BooleanLiteral;
  NumberLiteral: NumberLiteral;
  NullLiteral: NullLiteral;
  UndefinedLiteral: UndefinedLiteral;
  MustacheStatement: MustacheStatement;
  BlockStatement: BlockStatement;
  ElementModifierStatement: ElementModifierStatement;
  PartialStatement: PartialStatement;
  ElementNode: ElementNode;
  AttrNode: AttrNode;
  ConcatStatement: ConcatStatement;
  SubExpression: SubExpression;
  Hash: Hash;
  HashPair: HashPair;
 */
const { parse } = require("ember-template-recast");
const { traverse, } = require('@glimmer/syntax');

function getAttributes(source) {

  const attributes = new Set();
  const ast = parse(source);
  const excludeAttributes = new Set();
  const actions = new Set();

  traverse(ast, {
    BlockStatement(node) {
      excludeAttributes.add(node.path.original);
    },

    MustacheStatement(node) {
      if (node.path.original === 'action') {
        // add string Literals, recursively.
        getActionsRecursive(node);
        return;
      }

      if ((node.hash && node.hash.pairs.length > 0) || (node.params && node.params.length > 0)) {
        excludeAttributes.add(node.path.original);
      }
    },

    HashPair(node) {
      if (node.value.type === 'SubExpression' && node.value.path && node.value.path.original === 'action') {
        getActionsRecursive(node.value);
      }
    },

    PathExpression(node) {
      if (node.original === 'action') {
        return;
      }
      attributes.add(node.original);
    }
  });

  function getActionsRecursive(node) {
    if (node.type === 'StringLiteral') {
      actions.add(node.value);
    }
    if (!node.path) {
      return;
    }
    if (node.params && node.params.length > 0) {
      node.params.forEach(paramNode => {
        getActionsRecursive(paramNode)
      });
    }
  }

  return {
    attributes: [...attributes].filter(attr => !excludeAttributes.has(attr)),
    actions,
  }
}

module.exports = {
  getAttributes,
}
