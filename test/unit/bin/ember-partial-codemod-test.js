"use strict";

const execFile = require("child_process").execFile;
const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");

describe("ember-partial-codemod executable", function() {
  it("Finds and recast correctly using default transform" , function(done) {
    const cwd = "./test/fixtures/ember-partial-codemod/";
    const targetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/parent.hbs");
    const contentBeforeTransform = fs.readFileSync(targetPath);

    execFile(
      "node",
      ["../../../bin/ember-partial-codemod.js"],
      {
        cwd,
      },
      function(err, stdout, stderr) {
        const expectedContent = fs.readFileSync(path.resolve(cwd, "parent-after-transform.hbs"));
        const contentAfterTransform = fs.readFileSync(targetPath);

        expect(expectedContent.equals(contentAfterTransform)).to.be.true;

        // Revert the recast
        fs.writeFileSync(targetPath, contentBeforeTransform);
        done();
      }
    );
  });

  it("Finds and recast correctly using a custom transform" , function(done) {
    const cwd = "./test/fixtures/ember-partial-codemod/";
    const customTransformPath = path.resolve(cwd, "custom-transform.js");
    const targetPath = path.resolve(cwd, "fake-base-dir/addon/templates/components/parent.hbs");
    const contentBeforeTransform = fs.readFileSync(targetPath);

    execFile(
      "node",
      ["../../../bin/ember-partial-codemod.js", `--transform=${customTransformPath}`],
      {
        cwd,
      },
      function(err, stdout, stderr) {
        const expectedContent = fs.readFileSync(path.resolve(cwd, "parent-after-custom-transform.hbs"));
        const contentAfterTransform = fs.readFileSync(targetPath);

        expect(expectedContent.equals(contentAfterTransform)).to.be.true;

        // Revert the recast
        fs.writeFileSync(targetPath, contentBeforeTransform);
        done();
      }
    );
  });
});
