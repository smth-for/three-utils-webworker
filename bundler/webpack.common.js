const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const glob = require("glob");

const entryFiles = glob
  .sync("./src/**/*.js")
  .reduce((previousValue, currentValue, currentIndex, array) => {
    let response = {};
    console.log("TEST--------", currentIndex, previousValue, currentValue);

    if (typeof previousValue === "string") {
      response = {
        [(previousValue.includes("worker") ? 'workers/' : '') + path.basename(previousValue, path.extname(previousValue))]: previousValue,
        [(currentValue.includes("worker") ? 'workers/' : '') + path.basename(currentValue, path.extname(currentValue))]: currentValue,
      };
    } else {
      response = {
        ...previousValue,
        [(currentValue.includes("worker") ? 'workers/' : '') + path.basename(currentValue, path.extname(currentValue))]: currentValue,
      };
    }

    return response;
  });

console.log("TEST--------", entryFiles);

module.exports = {
  entry: entryFiles,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "../dist"),
  },
  devtool: "source-map",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "../static") }],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../src/index.html"),
      minify: false,
      chunks: ["index"],
    }),
    new MiniCSSExtractPlugin(),
  ],
  module: {
    rules: [
      // HTML
      {
        test: /\.(html)$/,
        use: ["html-loader"],
      },

      // JS
      {
        test: /\.js$/,
        exclude: [/node_modules/, /\.worker.js$/],
        use: ["babel-loader"],
      },

      // CSS
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, "css-loader"],
      },

      // Images
      {
        test: /\.(jpg|png|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/images/",
            },
          },
        ],
      },

      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/fonts/",
            },
          },
        ],
      },
    ],
  },
};
