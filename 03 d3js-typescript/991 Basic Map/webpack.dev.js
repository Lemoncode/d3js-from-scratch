const webpack = require("webpack");
const merge = require("webpack-merge");
const base = require("./webpack.config.js");
const path = require("path");

const basePath = __dirname;

module.exports = merge(base, {
  mode: "development",
  devtool: "eval-source-map",
  output: {
    filename: "[name].[hash].js",
  },
  devServer: {
    contentBase: path.join(basePath, "dist"),
    inline: true,
    host: "localhost",
    port: 4301,
    historyApiFallback: true,
    hot: true,
    stats: "minimal"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ],
});
