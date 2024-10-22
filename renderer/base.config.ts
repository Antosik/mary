import { Configuration, DefinePlugin } from "webpack";

import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { join as joinPath } from "path";
import TerserPlugin from "terser-webpack-plugin";
import { IgnorePlugin } from "webpack";

import { alias } from "../webpack.config";
import { version } from "../package.json";


const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";


const config: Configuration = ({
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? "hidden-source-map" : "cheap-module-source-map",

  resolve: {
    extensions: [".mjs", ".js", ".ts", ".svelte", ".html"],
    alias
  },

  entry: {
    main: joinPath(__dirname, "src/index.ts"),
    internal: joinPath(__dirname, "src/internal.ts"),
    settings: joinPath(__dirname, "src/settings.ts"),
    preload: joinPath(__dirname, "src/preload.ts")
  },

  output: {
    path: joinPath(__dirname, "..", "target/renderer"),
    filename: "[name].js"
  },

  plugins: [
    new DefinePlugin({
      VERSION: JSON.stringify(version)
    }),

    new IgnorePlugin(/.*\.js.map$/i),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: joinPath(__dirname, "static"),
          to: joinPath(__dirname, "..", "target"),
        }
      ]
    }),

    new MiniCssExtractPlugin({
      filename: "../css/[name].css"
    })
  ],

  optimization: {
    nodeEnv: isProduction ? "production" : "development",
    minimize: isProduction,
    minimizer: [new TerserPlugin({
      parallel: true,
      sourceMap: true,
      terserOptions: {
        keep_fnames: true,
      },
    })]
  },
});

export default config;