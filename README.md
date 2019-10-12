# ember-partial-codemod #

[![npm version](https://badge.fury.io/js/ember-partial-codemod.svg)](https://badge.fury.io/js/ember-partial-codemod)
[![Build Status](https://travis-ci.com/ygongdev/ember-partial-codemod.svg?branch=master)](https://travis-ci.com/ygongdev/ember-partial-codemod)

**THIS IS AN EXPERIMENTAL WORK IN PROGRESS. USE AT YOUR OWN RISK**

Given an `Ember` app or addon, this codemod will perform the following:
1. Transform `partial` into `component` using data it gathers from the `partial`.

## Table of Contents ##
1. [Installation](#installation)
2. [Usage](#usage)
3. [Example](#example)
3. [Explanation](#explanation)
4. [Todo](#todo)
5. [Contribution](#contribution)

## Installation ##

## Usage ##

```
./node_modules/.bin/ember-partial-codemod
```

## Example
TBA

## Explanation ##
This codemod parses the template file using the [glimmerVM AST](https://github.com/glimmerjs/glimmer-vm).

The codemod is broken into two major phases.

### Phase 1
1. By default, the codemod will crawl through all the `templates` starting with your current working directory, `cwd`, gathering all the information on each `template`.
2. If it finds a `partial` usage inside the current `template` it's crawling, it will intelligently infer the physical disk path of the `partial` from the `module name` and build a dependency tree/graph, where the current `template` is the parent of the `partial`.
3. **NOTE** There are cases where the codemod fails to crawl certain `templates`. One common case is when it infers correctly that a `partial`'s physical disk path lives outside of the `cwd`. The codemod will skip this `partial` and continue.

### Phase 2
1. The codemod will use the information from `Phase 1` to transform the `partials` accordingly using `ember-template-recast` internally.

## Todo ##
1. Make sure `get-attributes` is correct for all use cases.
2. Optimize Phase 1.
3. Handle `actions` in a better way.
4. Handle nested `partials`, e.g `A -> B -> C...`, where `A`,`B`,`C` are all `partials`.
4. Write tests.

## Contribution ##
Any contribution is appreciated!