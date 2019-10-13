# ember-partial-codemod #

[![npm version](https://badge.fury.io/js/ember-partial-codemod.svg)](https://badge.fury.io/js/ember-partial-codemod)
[![Build Status](https://travis-ci.com/ygongdev/ember-partial-codemod.svg?branch=master)](https://travis-ci.com/ygongdev/ember-partial-codemod)

**THIS IS AN EXPERIMENTAL WORK IN PROGRESS. USE AT YOUR OWN RISK. ISSUES ARE WELCOME**

Given an `Ember` app or addon, this codemod will transform all your `partials` into `components`.

## Table of Contents ##
1. [Installation](#installation)
2. [Usage](#usage)
3. [Example](#example)
3. [Explanation](#explanation)
4. [Todo](#todo)
5. [Contribution](#contribution)

## Installation ##

**Yarn**
```
yarn add ember-partial-codemod
```

**Npm**
```
npm install ember-partial-codemod
```

## Usage ##

```
./node_modules/.bin/ember-partial-codemod
```

## Example
Given a folder structure like so
```
base
└── addon
    ├── components
    │   ├── parent.js
    └── templates
        └── components
            ├── parent.hbs
            └── partials
                ├── child.hbs
                └── nested-child.hbs
```

### base/addon/templates/components/parent.hbs

**Before**
```javascript
{{some-component attr=attr}}
{{partial "base@partials/child"}}
{{partial "base$partials/child"}}
{{partial "base::partials/child"}}
```

**After**
```javascript
{{some-component attr=attr}}
{{base@partials/child bar=bar baz=baz action2=(action "action2")}}
{{base$partials/child bar=bar baz=baz action2=(action "action2")}}
{{base::partials/child bar=bar baz=baz action2=(action "action2")}}
```

### base/addon/templates/components/partials/child.hbs

**Before**
```javascript
{{bar}}
{{partial "base@partials/nested-child"}}
{{partial "base$partials/nested-child"}}
{{partial "base::partials/nested-child"}}
```

**After**
```javascript
{{bar}}
{{base@partials/nested-child baz=baz action2=(action "action2")}}
{{base$partials/nested-child baz=baz action2=(action "action2")}}
{{base::partials/nested-child baz=baz action2=(action "action2")}}
```

### base/addon/templates/components/partials/nested-child.hbs

**Before**
```javascript
{{baz}}
{{fizz
  action1=(action "action2")
}}
```

**After**
Nothing changed!
```javascript
{{baz}}
{{fizz
  action1=(action "action2")
}}
```

Note that in our example, we have `actions`!
The codemod will handle this by creating a new `.js` file for the component and intelligently infer its location to write to. This way the actions are properly passed to the new `component`.
So for our example, the codemod will generate the following structure. 
```
base
└── addon
    ├── components
    │   ├── parent.js
    │   └── partials <- new folder
    │       └── child.js <- new file!
    │       └── nested-child.js <- new file!
    └── templates
        └── components
            ├── parent.hbs
            └── partials
                ├── child.hbs
                └── nested-child.hbs
```

Notice how we have two new files now, `base/addon/components/partials/child.js` and `base/addon/components/partials/nested-child.js`.
They are both generated because we lost the `parent.js` scope, so actions will not be discovered anymore. Therefore, we faciliate the ability for `actions` to be passed down correctly by generating the associated `.js` files, so the actions are discoverable again.

### base/addon/templates/components/partials/child.hbs
```javascript
import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';

export default Component.extend({
	actions: {
		action2() {
			tryInvoke(this, 'action2');
		},
	}
});
```

### base/addon/templates/components/partials/nested-child.hbs
```javascript
import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';

export default Component.extend({
	actions: {
		action2() {
			tryInvoke(this, 'action2');
		},
	}
});
```

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
4. Write tests.

## Contribution ##
Any contribution is appreciated!