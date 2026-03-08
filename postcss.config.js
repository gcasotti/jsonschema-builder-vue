// @ts-check

import tailwindCss from "@tailwindcss/postcss";

// At-Rules that contain selectors that we want to scope
const AllowedAtRules = new Set(["media", "supports", "layer"]);

// tailwind is not suitable for libraries in general, so we use a plugin
// to add proper scoping to the generated CSS.
/** @type {() => import("postcss").Plugin} */
const cssScopingPlugin = () => {
  return {
    postcssPlugin: "replace-root-with-new_design",
    Once(root) {
      // Add .jscb class selector to all selectors
      root.walkRules((rule) => {
        if (
          rule.parent?.type === "atrule" &&
          !AllowedAtRules.has(rule.parent.name)
        ) {
          return;
        }
        const newSelectors = new Set();
        for (const selector of rule.selectors) {
          // See  https://github.com/tailwindlabs/tailwindcss/discussions/18108
          // Tailwind always uses :root / :host, but we want to scope it to .jscb
          // Replace :root and :host with .jscb
          if (selector === ":root" || selector === ":host") {
            newSelectors.add(".jscb");
          }
          // Scope universal selector
          else if (selector === "*") {
            newSelectors.add(".jscb");
            newSelectors.add(".jscb *");
          }
          // Prefix all other selectors with .jscb, if not already prefixed
          else if (!selector.startsWith(".jscb")) {
            newSelectors.add(`.jscb ${selector}`);
            newSelectors.add(addClassSelectorScope("jscb", selector));
          }
          // Already prefixed, so do nothing
          else {
            newSelectors.add(selector);
          }
        }
        rule.selectors = [...newSelectors];
      });

      // Prefix built-in animation names from tailwind with jscb-
      // See https://tailwindcss.com/docs/animation
      root.walkDecls((decl) => {
        if (decl.variable) {
          const animateMatch = /--animate-([a-zA-Z0-9_-]+)/.exec(decl.prop);
          if (animateMatch) {
            const animationName = animateMatch[1];
            decl.value = decl.value.replace(
              new RegExp(`\\b${animationName}\\b`, "g"),
              `jscb-${animationName}`,
            );
          }
        }
      });

      // Prefix @layer with jscb-
      root.walkAtRules((atRule) => {
        if (atRule.name === "layer" && !atRule.params.startsWith("jscb-")) {
          atRule.params = `jscb-${atRule.params}`;
        }
      });

      // Prefix built-in keyframe names from tailwind with jscb-
      // See https://tailwindcss.com/docs/animation
      root.walkAtRules((atRule) => {
        if (atRule.name === "keyframes" && !atRule.params.startsWith("jscb-")) {
          atRule.params = `jscb-${atRule.params}`;
        }
      });
    },
  };
};

/**
 * Adds the class name as a scope to the selector.
 *
 * - `table foo` => `table.jscb foo`
 * - `#foo .bar` => `.jscb#foo .bar`
 * - `.foo .bar` => `.jscb.foo .bar`
 * - `[data-attr="foo bar"] baz` => `.jscb[data-attr="foo bar"] baz`
 * - `:is(.foo, .bar) baz` => `.jscb:is(.foo, .bar) baz`
 * @param {string} className
 * @param {string} selector
 */
function addClassSelectorScope(className, selector) {
  // ID selector, class selector, attribute selector or pseudo-class / pseudo-element
  if (
    selector.startsWith(".") ||
    selector.startsWith("#") ||
    selector.startsWith("[") ||
    selector.startsWith(":")
  ) {
    return `.${className}${selector}`;
  }

  // Tag name
  // Note that for tag names, the class selector must be inserted after the tag name,
  // as in `table.jscb` instead of `.jscbtable`.
  const match = selector.match(/^([a-zA-Z0-9_-]+)/);
  if (match) {
    const tagName = match[1];
    return `${tagName}.${className}${selector.substring(tagName.length)}`;
  }

  return selector;
}

/** @type {{plugins:import("postcss").AcceptedPlugin[] }} */
export const config = {
  plugins: [tailwindCss(), cssScopingPlugin()],
};

export default config;
