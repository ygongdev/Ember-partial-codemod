# ember-partial-codemod #

[![npm version](https://badge.fury.io/js/ember-partial-codemod.svg)](https://badge.fury.io/js/ember-partial-codemod)
[![Build Status](https://travis-ci.com/ygongdev/ember-partial-codemod.svg?branch=master)](https://travis-ci.com/ygongdev/ember-partial-codemod)

**THIS IS AN EXPERIMENTAL WORK IN PROGRESS. USE AT YOUR OWN RISK**

Given a `partial`, this codemod will do the following:
1. Transform the `<partial>.hbs` into a corresponding `component.hbs`. `component.js`.
2. **[Feature Request]** Convert all `partial` usages into `component` usages.

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
./node_modules/.bin/ember-partial-codemod --input='../test/test.hbs' --ouput='../test/test.js'
```
## Example ##
### Input ###
Given **example.hbs**
```
{{#if a1}}
  <div class="{{a2}} {{if a3 "do not include 1"}}"
    tabindex={{a4}}
    aria-label={{a5}}
  >
    <img class={{a6}}
      id={{concat a7 "do not include 2"}}
      src={{a8}}
      alt="do not include 3"
      hi={{concat a9 "do not include 4"}}
      style={{a10}}
      onload={{action "action"}}
      onerror={{action (if "action1" a11)}}
      onWhatever={{action "action2" a12}}
      draggable={{a13}}>
  </div>
{{/if}}
```
### Output ###
Returns **example.js**
```
import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
/**
	ATTRIBUTES
	a1=a1
	a2=a2
	a3=a3
	a4=a4
	a5=a5
	a6=a6
	a7=a7
	a8=a8
	a9=a9
	a10=a10
	a11=a11
	a12=a12
	a13=a13
	action=(action "action)"
	action1=(action "action1)"
	action2=(action "action2)"
**/
export default Component.extend({
	actions: {
		action() {
			tryInvoke(this, 'action');
		},
		action1() {
			tryInvoke(this, 'action1');
		},
		action2() {
			tryInvoke(this, 'action2');
		},
	}
});

```

You can then manually convert all `partial` usage.
We can explore possibilities to automate this as well.
**Find**
```
{{partial "some-component"}}
```
**Replace**
```
{{some-component
	a1=a1
	a2=a2
	a3=a3
	a4=a4
	a5=a5
	a6=a6
	a7=a7
	a8=a8
	a9=a9
	a10=a10
	a11=a11
	a12=a12
	a13=a13
	action=(action "action")
	action1=(action "action1")
	action2=(action "action2")
}}
```

## Explanation ##
This codemod parses the template file using the [glimmerVM AST](https://github.com/glimmerjs/glimmer-vm).

1. Given an `input` template `.hbs` file, it will generate a list of all the `attributes` that the the template needs, including `actions`.
We only record `actions` with a `string` name as its `param`, e.g
`{{action "foo"}}`, `{{action (if isTrue "foo" "bar")}}`.
This is because we need to explicitly define the `action` inside the generated `.js` file.

2. Given the `output` path, it will generate a `.js` component file. The main purpose is to inform you what `attributes` this component needs and it should setups up all the `actions` for you as well.
If no `output` path is defined, it'll generate one in the same directory as the `input` path.
As described in [Example](#Example), you can utilize the generated doc to find and replace all the `partials` into the new `component`.

## Todo ##
1. Make sure `get-attributes` is correct for all use cases.
2. ~~Need to ignore attributes as part of closure~~
3. Find all the components that are consuming the current `partial` and convert them into the new `component` with the `attributes` passed in.
4. Write some tests

## Contribution ##
Any contribution is appreciated!