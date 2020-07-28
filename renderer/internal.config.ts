import { Configuration } from "webpack";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { join as joinPath } from "path";

import baseConfig from "./base.config";
import { preprocess } from "./svelte.config";


const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";


const config: Configuration = ({
  ...baseConfig,

  name: "mary-internal-view",
  target: "web",

  entry: {
    internal: joinPath(__dirname, "src/internal.ts"),
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
        test: /\.(j|t)s$/,
        loader: 'babel-loader',
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