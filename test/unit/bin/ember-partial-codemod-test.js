"use strict";

const execFile = require("child_process").execFile;
const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");

describe("ember-partial-codemod executable", function() {
  describe("given --input and --output", function() {
    it("should write component correctly", function(done) {
      const input = "templates/partial.hbs";
      const output = "components/partial.js";
      const actualOutput = "components/actual.js";
      const cwd = "./test/fixtures/with-input-and-output";

      execFile(
        "node",
        ["../../../bin/ember-partial-codemod.js", `--input=${input}`, `--output=${output}`],
        {
          cwd,
        },
        function(err, stdout, stderr) {
          const outputPath = path.resolve(cwd, output);
          const actualOutputPath = path.resolve(cwd, actualOutput);

          expect(outputPath, "output is created").to.be.not.empty;
          const outputContent = fs.readFileSync(outputPath);
          const actualOutputContent = fs.readFileSync(actualOutputPath);

          expect(outputContent.equals(actualOutputContent)).to.be.true;
          // Remove newly created output file.
          fs.unlinkSync(outputPath);

          expect(err).to.equal(null, "exits without error");
          expect(stdout).to.be.empty;
          expect(stderr).to.be.empty;
          done();
        }
      );
    });

    it("should throw error when --input is wrong", function(done) {
      const input = "templates/partial.txt";
      const output = "components/partial.js";
      const cwd = "./test/fixtures/with-input-and-output";

      execFile(
        "node",
        ["../../../bin/ember-partial-codemod.js", `--input=${input}`, `--output=${output}`],
        {
          cwd,
        },
        function(err, stdout, stderr) {
          const outputPath = path.resolve(cwd, output);
          expect(fs.existsSync(outputPath, "output is not created")).to.be.not.true;

          expect(err).to.be.not.empty;
          expect(stdout).to.be.empty;
          expect(stderr).to.equal("input file is not a Handlebars template.\n");
          done();
        }
      );
    });

    it("should throw error when --output is wrong", function(done) {
      const input = "templates/partial.hbs";
      const output = "components/partial.txt";
      const cwd = "./test/fixtures/with-input-and-output";
      execFile(
        "node",
        ["../../../bin/ember-partial-codemod.js", `--input=${input}`, `--output=${output}`],
        {
          cwd,
        },
        function(err, stdout, stderr) {
          const outputPath = path.resolve(cwd, output);
          expect(fs.existsSync(outputPath, "output is not created")).to.be.not.true;

          expect(err).to.be.not.empty;
          expect(stdout).to.be.empty;
          expect(stderr).to.equal("output file is not a Javascript file.\n");
          done();
        }
      );
    });
  });
});