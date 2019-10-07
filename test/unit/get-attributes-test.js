"use strict";

const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");
const { getAttributes } = require("../../src/get-attributes");
const expectedAttributes = require("../fixtures/attributes/attributes.json");

describe("getAttribute", function() {
  describe("Check correctness for only [attributes]", function() {
    describe("contains", function() {
      it("ElementNode with only MustacheStatement", function() {
        const template = `<div class={{foo}}></div>`;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.deep.equal(["foo"]);
        expect(attrs.actions).to.be.empty;
      });

      it("MustacheStatement with HashPair consist of dynamic value", function() {
        const template = `{{foo bar=baz}}`;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.deep.equal(["baz"]);
        expect(attrs.actions).to.be.empty;
      });

      it("MustacheStatement with dynamic Partial", function() {
        const template = `{{partial foo}}`;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.deep.equal(["foo"]);
        expect(attrs.actions).to.be.empty;
      });

      it("BlockStatement with Program blockParams and non-blockParams", function() {
        const template = `
          {{#foo as |bar|}}
            {{baz
              fizz=buzz
            }}
          {{/foo}}
        `;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.deep.equal(["buzz"]);
        expect(attrs.actions).to.be.empty;
      });
    });

    describe("does not contain", function() {
      it("MustacheStatement with HashPair consist of static stringLiteral", function() {
        const template = `{{foo bar="baz"}}`;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.empty;
        expect(attrs.actions).to.be.empty;
      });

      it("BlockStatement with Program blockParams", function() {
        const template = `
          {{#foo as |bar|}}
            {{baz
              fizz=bar
            }}
          {{/foo}}
        `;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.empty;
        expect(attrs.actions).to.be.empty;
      });
    });
  });

  describe("Check correctness for only [actions]", function() {
    describe("contains", function() {
      it("MustacheStatement with HashPair consist of an action with string name", function() {
        const template = `{{foo bar=(action "baz")}}`;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.be.empty;
        expect(attrs.actions).to.deep.equal(["baz"]);
      });

      it("MustacheStatement with HashPair consist of SubExpression action(s)", function() {
        const template = `{{foo bar=(if baz (action "baz") (action "fizz"))}}`;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.deep.equal(["baz"]);
        expect(attrs.actions).to.deep.equal(["baz", "fizz"]);
      });
    });

    describe("does not contain", function() {
      it ("MustacheStatement with HashPair consist of key called action", function() {
        const template = `{{foo action="bar"}}`;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.be.empty;
        expect(attrs.actions).to.be.empty;
      });
    });
  });

  describe("Check correctness for only [partials]", function() {
    describe("contains", function() {
      it("MustacheStatement with static Partial", function() {
        const template = `{{partial "foo"}}`;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.deep.equal(["foo"]);
        expect(attrs.attributes).to.be.empty;
        expect(attrs.actions).to.be.empty;
      });
    });

    describe("does not contain", function() {
      it("MustacheStatement with param named as partial", function() {
        const template = `{{foo partial=bar}}`;
        const attrs = getAttributes(template);
        expect(attrs.partials).to.be.empty;
        expect(attrs.attributes).to.deep.equal(["bar"]);
        expect(attrs.actions).to.be.empty;
      });
    });
  });

  describe("Check correctness for all", function() {
    it("generates correct attributes and actions", function() {
      const sourceDir = path.resolve("./test/fixtures/attributes", "partial.hbs");
      const source = fs.readFileSync(sourceDir).toString();

      const attrs = getAttributes(source);

      const attributesMatch = !attrs.attributes.some(attr => !expectedAttributes.attributes.includes(attr));
      const actionsMatch = !attrs.actions.some(action => !expectedAttributes.actions.includes(action));

      expect(attributesMatch).to.be.true;
      expect(actionsMatch).to.be.true;
    });

    it("ignores block params", function() {
      const sourceDir = path.resolve("./test/fixtures/attributes", "partial-with-block-params.hbs");
      const source = fs.readFileSync(sourceDir).toString();

      const attrs = getAttributes(source);

      const attributesMatch = !attrs.attributes.some(attr => !expectedAttributes.attributes.includes(attr));
      const actionsMatch = !attrs.actions.some(action => !expectedAttributes.actions.includes(action));

      expect(attributesMatch).to.be.true;
      expect(actionsMatch).to.be.true;
    });
  });
});