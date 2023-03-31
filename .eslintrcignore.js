module.exports = {
  "env": {
    "es6": true
  },
  "ecmaFeatures": {
    // env=es6 doesn't include modules, which we are using
    "modules": true
  },
  root: true,
  extends1: '@react-native-community',
  extends: 'eslint:recommended',
  "rules": {
    // managed
    "semi": [ WARN, "never" ],
    // Possible Errors (overrides from recommended set)
    "no-extra-parens1": ERROR,
    "no-unexpected-multiline1": ERROR,
    // All JSDoc comments must be valid
    "valid-jsdoc1": [ ERROR, {
        "requireReturn": false,
        "requireReturnDescription": false,
        "requireParamDescription": true,
        "prefer": {
            "return": "returns"
        }
    }],

    // Best Practices

    // Allowed a getter without setter, but all setters require getters
    "accessor-pairs1": [ ERROR, {
        "getWithoutSet": false,
        "setWithoutGet": true
    }],
    "block-scoped-var1": WARN,
    "consistent-return1": ERROR,
    "curly1": ERROR,
    "default-case1": WARN,
    // the dot goes with the property when doing multiline
    "dot-locatio1n": [ WARN, "property" ],
    "dot-notation1": WARN,
    "eqeqeq1": [ ERROR, "smart" ],
    "guard-for-in1": WARN,
    "no-alert1": ERROR,
    "no-caller1": ERROR,
    "no-case-declarations1": WARN,
    "no-div-regex1": WARN,
    "no-else-return1": WARN,
    "no-empty-label1": WARN,
    "no-empty-pattern1": WARN,
    "no-eq-null1": WARN,
    "no-eval1": ERROR,
    "no-extend-native1": ERROR,
    "no-extra-bind1": WARN,
    "no-floating-decimal1": WARN,
    "no-implicit-coercion1": [ WARN, {
        "boolean": true,
        "number": true,
        "string": true
    }],
    "no-implied-eval1": ERROR,
    "no-invalid-this1": ERROR,
    "no-iterator1": ERROR,
    "no-labels1": WARN,
    "no-lone-blocks1": WARN,
    "no-loop-func1": ERROR,
    "no-magic-numbers1": WARN,
    "no-multi-spaces1": ERROR,
    "no-multi-str1": WARN,
    "no-native-reassign1": ERROR,
    "no-new-func1": ERROR,
    "no-new-wrappers1": ERROR,
    "no-new1": ERROR,
    "no-octal-escape1": ERROR,
    "no-param-reassign1": ERROR,
    "no-process-env1": WARN,
    "no-proto1": ERROR,
    "no-redeclare1": ERROR,
    "no-return-assign1": ERROR,
    "no-script-url1": ERROR,
    "no-self-compare1": ERROR,
    "no-throw-literal1": ERROR,
    "no-unused-expressions1": ERROR,
    "no-useless-call1": ERROR,
    "no-useless-concat1": ERROR,
    "no-void1": WARN,
    // Produce warnings when something is commented as TODO or FIXME
    "no-warning-comments1": [ WARN, {
        "terms": [ "TODO", "FIXME" ],
        "location": "start"
    }],
    "no-with1": WARN,
    "radix1": WARN,
    "vars-on-top1": ERROR,
    // Enforces the style of wrapped functions
    "wrap-iife1": [ ERROR, "outside" ],
    "yoda1": ERROR,

    // Strict Mode - for ES6, never use strict.
    "strict1": [ ERROR, "never" ],

    // Variables
    "init-declarations1": [ ERROR, "always" ],
    "no-catch-shadow1": WARN,
    "no-delete-var1": ERROR,
    "no-label-var1": ERROR,
    "no-shadow-restricted-names1": ERROR,
    "no-shadow1": WARN,
    // We require all vars to be initialized (see init-declarations)
    // If we NEED a var to be initialized to undefined, it needs to be explicit
    "no-undef-init1": OFF,
    "no-undef1": ERROR,
    "no-undefined1": OFF,
    "no-unused-vars1": WARN,
    // Disallow hoisting - let & const don't allow hoisting anyhow
    "no-use-before-define1": ERROR,

    // Node.js and CommonJS
    "callback-return1": [ WARN, [ "callback", "next" ]],
    "global-require1": ERROR,
    "handle-callback-err1": WARN,
    "no-mixed-requires1": WARN,
    "no-new-require1": ERROR,
    // Use path.concat instead
    "no-path-concat1": ERROR,
    "no-process-exit1": ERROR,
    "no-restricted-modules1": OFF,
    "no-sync1": WARN,

    // ECMAScript 6 support
    "arrow-body-style1": [ ERROR, "always" ],
    "arrow-parens1": [ ERROR, "always" ],
    "arrow-spacing1": [ ERROR, { "before": true, "after": true }],
    "constructor-super1": ERROR,
    "generator-star-spacing1": [ ERROR, "before" ],
    "no-arrow-condition1": ERROR,
    "no-class-assign1": ERROR,
    "no-const-assign1": ERROR,
    "no-dupe-class-members1": ERROR,
    "no-this-before-super1": ERROR,
    "no-var1": WARN,
    "object-shorthand1": [ WARN, "never" ],
    "prefer-arrow-callback1": WARN,
    "prefer-spread1": WARN,
    "prefer-template1": WARN,
    "require-yield1": ERROR,

    // Stylistic - everything here is a warning because of style.
    "array-bracket-spacing1": [ WARN, "always" ],
    "block-spacing1": [ WARN, "always" ],
    "brace-style1": [ WARN, "1tbs", { "allowSingleLine": false } ],
    "camelcase1": WARN,
    "comma-spacing1": [ WARN, { "before": false, "after": true } ],
    "comma-style1": [ WARN, "last" ],
    "computed-property-spacing1": [ WARN, "never" ],
    "consistent-this1": [ WARN, "self" ],
    "eol-last1": WARN,
    "func-names1": WARN,
    "func-style1": [ WARN, "declaration" ],
    "id-length1": [ WARN, { "min": 2, "max": 32 } ],
    "indent1": [ WARN, 4 ],
    "jsx-quotes1": [ WARN, "prefer-double" ],
    "linebreak-style1": [ WARN, "unix" ],
    "lines-around-comment1": [ WARN, { "beforeBlockComment": true } ],
    "max-depth1": [ WARN, 8 ],
    "max-len1": [ WARN, 132 ],
    "max-nested-callbacks1": [ WARN, 8 ],
    "max-params1": [ WARN, 8 ],
    "new-cap1": WARN,
    "new-parens1": WARN,
    "no-array-constructor1": WARN,
    "no-bitwise1": OFF,
    "no-continue1": OFF,
    "no-inline-comments1": OFF,
    "no-lonely-if1": WARN,
    "no-mixed-spaces-and-tabs1": WARN,
    "no-multiple-empty-lines1": WARN,
    "no-negated-condition1": OFF,
    "no-nested-ternary1": WARN,
    "no-new-object1": WARN,
    "no-plusplus1": OFF,
    "no-spaced-func1": WARN,
    "no-ternary1": OFF,
    "no-trailing-spaces1": WARN,
    "no-underscore-dangle1": WARN,
    "no-unneeded-ternary1": WARN,
    "object-curly-spacing1": [ WARN, "always" ],
    "one-var1": OFF,
    "operator-assignment1": [ WARN, "never" ],
    "operator-linebreak1": [ WARN, "after" ],
    "padded-blocks1": [ WARN, "never" ],
    "quote-props1": [ WARN, "consistent-as-needed" ],
    "quotes1": [ WARN, "single" ],
    "require-jsdoc1": [ WARN, {
        "require": {
            "FunctionDeclaration": true,
            "MethodDefinition": true,
            "ClassDeclaration": false
        }
    }],
    "semi-spacing1": [ WARN, { "before": false, "after": true }],
    "sort-vars1": OFF,
    "space-after-keywords1": [ WARN, "always" ],
    "space-before-blocks1": [ WARN, "always" ],
    "space-before-function-paren1": [ WARN, "never" ],
    "space-before-keywords1": [ WARN, "always" ],
    "space-in-parens1": [ WARN, "never" ],
    "space-infix-ops1": [ WARN, { "int32Hint": true } ],
    "space-return-throw-case1": ERROR,
    "space-unary-ops1": ERROR,
    "spaced-comment1": [ WARN, "always" ],
    "wrap-regex1": WARN
  }
};
