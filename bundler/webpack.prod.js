const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.common.js");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const LicenseCheckerWebpackPlugin = require("license-checker-webpack-plugin");

module.exports = merge(commonConfiguration, {
  mode: "production",
  plugins: [
    new CleanWebpackPlugin(),
    new LicenseCheckerWebpackPlugin({
      outputFilename: "ThirdPartyLicenses.txt",
    }),
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
            topLevel: true,
        },
        parallel: true,
      }),
    ],
  },
});
