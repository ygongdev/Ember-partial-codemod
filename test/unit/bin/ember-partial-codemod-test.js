"use strict";

const execFile = require("child_process").execFile;
const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");

describe("ember-partial-codemod executable", function() {
  const cwd = "./test/fixtures/ember-partial-codemod/";
  const parentTargetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/parent.hbs");
  const childTargetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/partials/child.hbs");
  const expectedChildComponent = fs.readFileSync(path.resolve(cwd, "expected-child.js"));

  const parentContentBeforeTransform = fs.readFileSync(parentTargetPath);
  const childContentBeforeTransform = fs.readFileSync(childTargetPath);

  it("Finds and recast correctly using default transform" , function(done) {
    execFile(
      "node",
      ["../../../bin/ember-partial-codemod.js"],
      {
        cwd,
      },
      function(err, stdout, stderr) {
        const parentContentAfterTransform = fs.readFileSync(parentTargetPath);
        const childContentAfterTransform = fs.readFileSync(childTargetPath);
        const childComponentTargetPath = path.resolve(cwd, "fake-base-dir/addon/components/partials/child.js");
        const childComponentAfterTransform = fs.readFileSync(childComponentTargetPath);

        const expectedParentContent = fs.readFileSync(path.resolve(cwd, "parent-after-transform.hbs"));
        const expectedChildContent = fs.readFileSync(path.resolve(cwd, "child-after-transform.hbs"));

        expect(expectedParentContent.equals(parentContentAfterTransform)).to.be.true;
        expect(expectedChildContent.equals(childContentAfterTransform)).to.be.true;
        expect(expectedChildComponent.equals(childComponentAfterTransform)).to.be.true;

        // Revert the recast
        fs.writeFileSync(parentTargetPath, parentContentBeforeTransform);
        fs.writeFileSync(childTargetPath, childContentBeforeTransform);
        fs.unlinkSync(childComponentTargetPath);

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
        const parentContentAfterTransform = fs.readFileSync(parentTargetPath);
        const childContentAfterTransform = fs.readFileSync(childTargetPath);
        const childComponentTargetPath = path.resolve(cwd, "fake-base-dir/addon/components/partials/child.js");
        const childComponentAfterTransform = fs.readFileSync(childComponentTargetPath);

        const expectedChildComponent = fs.readFileSync(path.resolve(cwd, "expected-child.js"));
        const expectedParentContent = fs.readFileSync(path.resolve(cwd, "parent-after-custom-transform.hbs"));
        const expectedChildContent = fs.readFileSync(path.resolve(cwd, "child-after-custom-transform.hbs"));

        expect(expectedParentContent.equals(parentContentAfterTransform)).to.be.true;
        expect(expectedChildContent.equals(childContentAfterTransform)).to.be.true;
        expect(expectedChildComponent.equals(childComponentAfterTransform)).to.be.true;

        // Revert the recast
        fs.writeFileSync(parentTargetPath, parentContentBeforeTransform);
        fs.writeFileSync(childTargetPath, childContentBeforeTransform);
        fs.unlinkSync(childComponentTargetPath);

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
        const parentContentAfterTransform = fs.readFileSync(parentTargetPath);
        const childContentAfterTransform = fs.readFileSync(childTargetPath);
        const childComponentTargetPath = path.resolve(cwd, "fake-base-dir/addon/components/partials/child.js");
        const childComponentAfterTransform = fs.readFileSync(childComponentTargetPath);

        const expectedParentContent = fs.readFileSync(path.resolve(cwd, "parent-after-transform-with-replace-delimiter.hbs"));
        const expectedChildContent = fs.readFileSync(path.resolve(cwd, "child-after-transform-with-replace-delimiter.hbs"));

        expect(expectedParentContent.equals(parentContentAfterTransform)).to.be.true;
        expect(expectedChildContent.equals(childContentAfterTransform)).to.be.true;
        expect(expectedChildComponent.equals(childComponentAfterTransform)).to.be.true;

        // Revert the recast
        fs.writeFileSync(parentTargetPath, parentContentBeforeTransform);
        fs.writeFileSync(childTargetPath, childContentBeforeTransform);
        fs.unlinkSync(childComponentTargetPath);

        done();
      }
    );
  });
});
