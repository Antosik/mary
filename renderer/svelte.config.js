const { join: joinPath } = require("path");
const sveltePreprocess = require("svelte-preprocess");

module.exports.preprocess = sveltePreprocess({
  typescript: {
    transpileOnly: true,
    tsconfigFile: joinPath(__dirname, "tsconfig.json"),
    compilerOptions: {
      paths: {
        "@mary-main/*": ["main/src/*"],
        "@mary-web/*": ["renderer/src/*"],
        "@mary-shared/*": ["shared/*"],
      }
    },
  },
  postcss: true
});