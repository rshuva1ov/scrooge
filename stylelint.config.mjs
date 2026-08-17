/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard-scss", "stylelint-config-prettier-scss"],
  plugins: ["stylelint-order"],
  rules: {
    "selector-class-pattern": [
      "^[a-z][a-zA-Z0-9-]*(__[a-z][a-zA-Z0-9-]*)?(_[a-zA-Z0-9-]+)*$",
      {
        message: "Class must follow pattern: myBlock, myBlock__myElement, myBlock_modifier",
        resolveNestedSelectors: true
      }
    ],
    "order/order": [
      [
        "dollar-variables",
        "custom-properties",
        "declarations",
        {
          type: "rule",
          selector: /^&:(hover|focus|focus-visible|active|disabled)/
        },
        "rules",
        { type: "at-rule", name: "media" }
      ],
      { severity: "error" }
    ],
    "unit-disallowed-list": [
      "px",
      {
        ignoreFunctions: ["/^var$/"],
        message: "Use rem instead of px"
      }
    ],
    "declaration-empty-line-before": null,
    "rule-empty-line-before": null,
    "custom-property-pattern": null,
    "no-descending-specificity": null,
    "alpha-value-notation": null,
    "max-nesting-depth": [3, { ignoreAtRules: ["media"] }]
  },
  ignoreFiles: ["dist/**", "node_modules/**", "src/app/styles/**"]
};
