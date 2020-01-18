"use strict";

const execFileSync = require("child_process").execFileSync;
const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");

const testTemplateCwd = "./test/fixtures/ember-partial-codemod/mock-trunk/";
const expectedTemplateCwd = "./test/fixtures/ember-partial-codemod/";

describe("ember-partial-codemod executable", function() {
  beforeEach(function(done) {
    this.parentTemplate = path.resolve(testTemplateCwd, "lib/fake-base-dir/addon/templates/components/parent.hbs");
    this.parentTemplateBeforeTransform = fs.readFileSync(this.parentTemplate);
    this.childTemplate = path.resolve(testTemplateCwd, "lib/fake-base-dir/addon/templates/partials/child.hbs");
    this.childTemplateBeforeTransform = fs.readFileSync(this.childTemplate);
    this.nestedChildTemplate = path.resolve(testTemplateCwd, "lib/fake-base-dir/addon/templates/partials/nested-child.hbs");
    this.nestedChildTemplateBeforeTransform = fs.readFileSync(this.nestedChildTemplate);
    done();
  });

  afterEach(function(done) {
    // Revert the recast
    fs.writeFileSync(this.parentTemplate, this.parentTemplateBeforeTransform);
    fs.writeFileSync(this.postChildTemplate, this.childTemplateBeforeTransform);
    fs.writeFileSync(this.postNestedChildTemplate, this.nestedChildTemplateBeforeTransform);

    fse.moveSync(this.postChildTemplate, this.childTemplate);
    fse.moveSync(this.postNestedChildTemplate, this.nestedChildTemplate);
    done();
  });

  it("Finds and recast correctly using default transform", function(done) {
    execFileSync("ember-partial-codemod", [], { cwd: testTemplateCwd });
    this.postChildTemplate = path.resolve(testTemplateCwd, "lib/fake-base-dir/addon/templates/components/partials/child.hbs");
    this.postNestedChildTemplate = path.resolve(testTemplateCwd, "lib/fake-base-dir/addon/templates/components/partials/nested-child.hbs");
    const parentTemplateAfterTransform = fs.readFileSync(this.parentTemplate);
    const childTemplateAfterTransform = fs.readFileSync(this.postChildTemplate);
    // const nestedChildTemplateAfterTransform = fs.readFileSync(this.postNestedChildTemplate);

    const expectedParentTemplate = fs.readFileSync(path.resolve(expectedTemplateCwd, "parent-after-transform.hbs"));
    const expectedChildTemplate = fs.readFileSync(path.resolve(expectedTemplateCwd, "child-after-transform.hbs"));
    // const expectedNestedChildTemplate = fs.readFileSync(path.resolve(expectedNestedTemplateCwd, "child-after-transform.hbs"));

    expect(expectedParentTemplate.equals(parentTemplateAfterTransform)).to.be.true;
    expect(expectedChildTemplate.equals(childTemplateAfterTransform)).to.be.true;
    done();
  });

  it("Finds and recast correctly using replaceDelimiter", function(done) {
    execFileSync("ember-partial-codemod", ["--rd='$'"], { cwd: testTemplateCwd });
    this.postChildTemplate = path.resolve(testTemplateCwd, "lib/fake-base-dir/addon/templates/components/partials/child.hbs");
    this.postNestedChildTemplate = path.resolve(testTemplateCwd, "lib/fake-base-dir/addon/templates/components/partials/nested-child.hbs");
    const parentTemplateAfterTransform = fs.readFileSync(this.parentTemplate);
    const childTemplateAfterTransform = fs.readFileSync(this.postChildTemplate);
    // const nestedChildTemplateAfterTransform = fs.readFileSync(this.postNestedChildTemplate);

    const expectedParentTemplate = fs.readFileSync(path.resolve(expectedTemplateCwd, "parent-after-transform-with-replace-delimiter.hbs"));
    const expectedChildTemplate = fs.readFileSync(path.resolve(expectedTemplateCwd, "child-after-transform-with-replace-delimiter.hbs"));
    // const expectedNestedChildTemplate = fs.readFileSync(path.resolve(expectedNestedTemplateCwd, "child-after-transform.hbs"));

    expect(expectedParentTemplate.equals(parentTemplateAfterTransform)).to.be.true;
    expect(expectedChildTemplate.equals(childTemplateAfterTransform)).to.be.true;
    done();
  });

  it("Finds and recast correctly using a custom transform", function(done) {
    const customTransformPath = path.resolve(expectedTemplateCwd, "custom-transform.js");
    execFileSync("ember-partial-codemod", [`--t=${customTransformPath}`], { cwd: testTemplateCwd });
    this.postChildTemplate = path.resolve(testTemplateCwd, "lib/fake-base-dir/addon/templates/components/partials/child.hbs");
    this.postNestedChildTemplate = path.resolve(testTemplateCwd, "lib/fake-base-dir/addon/templates/components/partials/nested-child.hbs");
    const parentTemplateAfterTransform = fs.readFileSync(this.parentTemplate);
    const childTemplateAfterTransform = fs.readFileSync(this.postChildTemplate);
    // const nestedChildTemplateAfterTransform = fs.readFileSync(this.postNestedChildTemplate);

    const expectedParentTemplate = fs.readFileSync(path.resolve(expectedTemplateCwd, "parent-after-custom-transform.hbs"));
    const expectedChildTemplate = fs.readFileSync(path.resolve(expectedTemplateCwd, "child-after-custom-transform.hbs"));
    // const expectedNestedChildTemplate = fs.readFileSync(path.resolve(expectedNestedTemplateCwd, "child-after-transform.hbs"));

    expect(expectedParentTemplate.equals(parentTemplateAfterTransform)).to.be.true;
    expect(expectedChildTemplate.equals(childTemplateAfterTransform)).to.be.true;
    done();
  });
});