"use strict";

const execFile = require("child_process").execFile;
const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");

describe("ember-partial-codemod executable", function() {
  it("Finds and recast correctly using default transform" , function(done) {
    const cwd = "./test/fixtures/ember-partial-codemod/";
    const parentTargetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/parent.hbs");
    const childTargetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/partials/child.hbs");

    const parentContentBeforeTransform = fs.readFileSync(parentTargetPath);
    const childContentBeforeTransform = fs.readFileSync(childTargetPath);

    execFile(
      "node",
      ["../../../bin/ember-partial-codemod.js"],
      {
        cwd,
      },
      function(err, stdout, stderr) {
        const parentExpectedContent = fs.readFileSync(path.resolve(cwd, "parent-after-transform.hbs"));
        const parentContentAfterTransform = fs.readFileSync(parentTargetPath);
        const childExpectedContent = fs.readFileSync(path.resolve(cwd, "child-after-transform.hbs"));
        const childContentAfterTransform = fs.readFileSync(childTargetPath);

        expect(parentExpectedContent.equals(parentContentAfterTransform)).to.be.true;
        expect(childExpectedContent.equals(childContentAfterTransform)).to.be.true;

        // Revert the recast
        fs.writeFileSync(parentTargetPath, parentContentBeforeTransform);
        fs.writeFileSync(childTargetPath, childContentBeforeTransform);

        done();
      }
    );
  });

  it("Finds and recast correctly using a custom transform" , function(done) {
    const cwd = "./test/fixtures/ember-partial-codemod/";
    const customTransformPath = path.resolve(cwd, "custom-transform.js");
    const parentTargetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/parent.hbs");
    const childTargetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/partials/child.hbs");

    const parentContentBeforeTransform = fs.readFileSync(parentTargetPath);
    const childContentBeforeTransform = fs.readFileSync(childTargetPath);

    execFile(
      "node",
      ["../../../bin/ember-partial-codemod.js", `--transform=${customTransformPath}`],
      {
        cwd,
      },
      function(err, stdout, stderr) {
        const parentExpectedContent = fs.readFileSync(path.resolve(cwd, "parent-after-custom-transform.hbs"));
        const parentContentAfterTransform = fs.readFileSync(parentTargetPath);
        const childExpectedContent = fs.readFileSync(path.resolve(cwd, "child-after-custom-transform.hbs"));
        const childContentAfterTransform = fs.readFileSync(childTargetPath);

        expect(parentExpectedContent.equals(parentContentAfterTransform)).to.be.true;
        expect(childExpectedContent.equals(childContentAfterTransform)).to.be.true;

        // Revert the recast
        fs.writeFileSync(parentTargetPath, parentContentBeforeTransform);
        fs.writeFileSync(childTargetPath, childContentBeforeTransform);

        done();
      }
    );
  });
});
