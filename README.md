**THIS IS AN EXPERIMENTAL WORK IN PROGRESS. USE AT YOUR OWN RISK**

# What this does #
1. Given an `input` template `.hbs` file, it will generate a list of all the `attributes` that the the template needs, including `actions`.
We only record `actions` with a `string` name as its `param`, e.g
`{{action "foo"}}`, `{{action (if isTrue "foo" "bar")}}`.
This is because we need to explicitly define the `action` inside the generated `.js` file.
2. Given the `output` path, it will generate a `.js` component file. The main purpose is to inform you what `attributes` this component needs and it should setups up all the `actions` for you as well.

# TODO #
1. Locate all the components consuming the `partial`.
2. Convert the `partial template` into a `component template`
3. Somehow access what attributes are available to the consuming components and pass in the attributes that the `partial` needs appropiately.

# Usage  #

```
./node_modules/.bin/ember-partial-codemod --inpu='../test/test.hbs' --ouput='../test.test.js'
```