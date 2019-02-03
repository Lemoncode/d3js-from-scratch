const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const basePath = __dirname;

module.exports = {
  context: path.join(basePath, "src"),
  resolve: {
    extensions: [".js", ".ts"],
  },
  entry: {
    app: ["./app.ts"],
  },
  output: {
    path: path.join(basePath, "dist"),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendorGroup: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              modules: true,
              camelCase: true,
              importLoaders: 1,
              localIdentName: "[local]___[hash:base64:5]",
            },
          },
          { loader: "resolve-url-loader" },
          { loader: "sass-loader" },
        ],
      },
      // Font resources embedded in final bundle with url-loader.
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader",
        options: {
          mimetype: "application/font-woff"
        }
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader",
        options: {
          mimetype: "application/octet-stream"
        }
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader"
      },
      // Common files, emitted to the output directory
      {
        test: /\.(png|jpg|ico|gif|svg|webp)?$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]"
        }
      },
      // Possible Data sources as files.
      {
        type: "javascript/auto",
        test: /\.(geojson|topojson|json|tsv)?$/,
        include: /data/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]"
        }
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "index.html",
      hash: true,
      chunksSortMode: "manual",
      chunks: ["vendor", "app"],
    }),
  ],
};
