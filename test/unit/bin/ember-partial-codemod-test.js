"use strict";

const execFile = require("child_process").execFile;
const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");

describe("ember-partial-codemod executable", function() {
  const cwd = "./test/fixtures/ember-partial-codemod/";
  const parentTargetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/parent.hbs");
  const childTargetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/partials/child.hbs");
  const expectedChildComponent = fs.readFileSync(path.resolve(cwd, "expected-child.js"));
  const expectedNestedChildComponent = fs.readFileSync(path.resolve(cwd, "expected-nested-child.js"));
  const newPartialComponentDir = "fake-base-dir/addon/components/partials/";

  const parentTemplateBeforeTransform = fs.readFileSync(parentTargetPath);
  const childTemplateBeforeTransform = fs.readFileSync(childTargetPath);

  afterEach(function() {
    // Revert the recast
    fs.writeFileSync(parentTargetPath, parentTemplateBeforeTransform);
    fs.writeFileSync(childTargetPath, childTemplateBeforeTransform);
    rimraf.sync(path.resolve(cwd, newPartialComponentDir));
  });

  it("Finds and recast correctly using default transform" , function(done) {
    execFile(
      "node",
      ["../../../bin/ember-partial-codemod.js"],
      {
        cwd,
      },
      function(err, stdout, stderr) {
        const parentTemplateAfterTransform = fs.readFileSync(parentTargetPath);
        const childTemplateAfterTransform = fs.readFileSync(childTargetPath);
        const childComponentTargetPath = path.resolve(cwd, "fake-base-dir/addon/components/partials/child.js");
        const childComponentAfterTransform = fs.readFileSync(childComponentTargetPath);
        const nestedChildComponentTargetPath = path.resolve(cwd, "fake-base-dir/addon/components/partials/nested-child.js");
        const nestedChildComponentAfterTransform = fs.readFileSync(nestedChildComponentTargetPath);

        const expectedParentTemplate = fs.readFileSync(path.resolve(cwd, "parent-after-transform.hbs"));
        const expectedChildTemplate = fs.readFileSync(path.resolve(cwd, "child-after-transform.hbs"));

        expect(expectedParentTemplate.equals(parentTemplateAfterTransform)).to.be.true;
        expect(expectedChildTemplate.equals(childTemplateAfterTransform)).to.be.true;
        expect(expectedChildComponent.equals(childComponentAfterTransform)).to.be.true;
        expect(expectedNestedChildComponent.equals(nestedChildComponentAfterTransform)).to.be.true;

        done();
      }
    );
  });

  it("Finds and recast correctly using a custom transform" , function(done) {
    const customTransformPath = path.resolve(cwd, "custom-transform.js");
    execFile(
      "node",
      ["../../../bin/ember-partial-codemod.js", `--t=${customTransformPath}`],
      {
        cwd,
      },
      function(err, stdout, stderr) {
        const parentTemplateAfterTransform = fs.readFileSync(parentTargetPath);
        const childTemplateAfterTransform = fs.readFileSync(childTargetPath);
        const childComponentTargetPath = path.resolve(cwd, "fake-base-dir/addon/components/partials/child.js");
        const childComponentAfterTransform = fs.readFileSync(childComponentTargetPath);
        const nestedChildComponentTargetPath = path.resolve(cwd, "fake-base-dir/addon/components/partials/nested-child.js");
        const nestedChildComponentAfterTransform = fs.readFileSync(nestedChildComponentTargetPath);

        const expectedChildComponent = fs.readFileSync(path.resolve(cwd, "expected-child.js"));
        const expectedParentTemplate = fs.readFileSync(path.resolve(cwd, "parent-after-custom-transform.hbs"));
        const expectedChildTemplate = fs.readFileSync(path.resolve(cwd, "child-after-custom-transform.hbs"));

        expect(expectedParentTemplate.equals(parentTemplateAfterTransform)).to.be.true;
        expect(expectedChildTemplate.equals(childTemplateAfterTransform)).to.be.true;
        expect(expectedChildComponent.equals(childComponentAfterTransform)).to.be.true;
        expect(expectedNestedChildComponent.equals(nestedChildComponentAfterTransform)).to.be.true;

        done();
      }
    );
  });

  it("Finds and recast correctly using replaceDelimiter" , function(done) {
    execFile(
      "node",
      ["../../../bin/ember-partial-codemod.js", "--rd='$'"],
      {
        cwd,
      },
      function(err, stdout, stderr) {
        const parentTemplateAfterTransform = fs.readFileSync(parentTargetPath);
        const childTemplateAfterTransform = fs.readFileSync(childTargetPath);
        const childComponentTargetPath = path.resolve(cwd, "fake-base-dir/addon/components/partials/child.js");
        const childComponentAfterTransform = fs.readFileSync(childComponentTargetPath);
        const nestedChildComponentTargetPath = path.resolve(cwd, "fake-base-dir/addon/components/partials/nested-child.js");
        const nestedChildComponentAfterTransform = fs.readFileSync(nestedChildComponentTargetPath);

        const expectedParentTemplate = fs.readFileSync(path.resolve(cwd, "parent-after-transform-with-replace-delimiter.hbs"));
        const expectedChildTemplate = fs.readFileSync(path.resolve(cwd, "child-after-transform-with-replace-delimiter.hbs"));

        expect(expectedParentTemplate.equals(parentTemplateAfterTransform)).to.be.true;
        expect(expectedChildTemplate.equals(childTemplateAfterTransform)).to.be.true;
        expect(expectedChildComponent.equals(childComponentAfterTransform)).to.be.true;
        expect(expectedNestedChildComponent.equals(nestedChildComponentAfterTransform)).to.be.true;

        done();
      }
    );
  });
});
