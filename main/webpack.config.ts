import { Configuration, DefinePlugin } from "webpack";

import CopyWebpackPlugin from "copy-webpack-plugin";
import { join as joinPath } from "path";
import TerserPlugin from "terser-webpack-plugin";

import { alias } from "../webpack.config";
import { version } from "../package.json";


const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";


const config: Configuration = {
  name: "mary-app",
  target: "electron-main",

  mode: "none",
  devtool: isProduction ? "hidden-source-map" : "cheap-module-source-map",

  resolve: {
    extensions: [".js", ".ts", ".node"],
    alias
  },
  entry: joinPath(__dirname, "src/index.ts"),
  output: {
    path: joinPath(__dirname, "..", "target/app"),
    filename: "main.js"
  },

  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
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
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },

  externals: {
    "electron-overlay-window": 'require("electron-overlay-window")',
    "uiohook-napi": 'require("uiohook-napi")'
  },

  plugins: [
    new DefinePlugin({
      VERSION: JSON.stringify(version)
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: joinPath(__dirname, "static"),
          to: joinPath(__dirname, "..", "target")
        }
      ]
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
  }
}

export default config;