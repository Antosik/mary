import type { Configuration } from "webpack";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { join as joinPath } from "path";

import baseConfig from "./base.config";
import { preprocess } from "./svelte.config";


const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";


const config: Configuration = ({
  ...baseConfig,

  name: "mary-view",
  target: "electron-renderer",

  mode: "none",

  entry: {
    main: joinPath(__dirname, "src/index.ts"),
    settings: joinPath(__dirname, "src/settings.ts"),
    overlay: joinPath(__dirname, "src/overlay.ts"),
    preload: joinPath(__dirname, "src/preload.ts")
  },

  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            dev: !isProduction,
            hotReload: !isProduction,
            immutable: true,
            emitCss: true,
            preprocess
          }
        }
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 1 } },
          { loader: "postcss-loader" }
        ]
      }
    ]
  },
});

export default config;