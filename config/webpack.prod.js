const baseWebpack = require('./webpack.base');
const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
function resolve(dirname) {
  console.log(path.resolve(__dirname, dirname));
  return path.resolve(__dirname, dirname);
}
module.exports = merge(baseWebpack, {
  devtool: false,
  mode: 'production',
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            warnings: false,
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!static-files*'],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new HtmlWebpackPlugin({
      template: resolve("../public/index.html"),
      filename: "index.html",
      minify: true,
      inject: true,
      chunks: ['manifest', 'vendor', 'pve'],
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 20,
      minChunkSize: 100
    }),
    new webpack.optimize.SplitChunksPlugin({
      chunks: "async", // Must choose one of: "initial" | "all"(default) | "async". async is on-demand import, all will bundle both entry files and dynamically imported files, initial mode will re-split dependencies in entry files into a new file, dynamically imported files in other files will not be split
      minSize: 1000, // Minimum size, default 0
      minChunks: 1, // Minimum chunks, default 1
      maxAsyncRequests: 1, // Maximum number of async requests, default 1
      maxInitialRequests: 1, // Maximum number of initial requests, default 1
      maxChunks: 10,
      name: function (name) {
        return name
      }, // Name, this option can accept a function
      // cacheGroups: { // Start setting cache chunks here
      //   priority: 0, // Cache group priority
      //   vendor: { // key is the entry name defined in entry
      //     chunks: "async", // Must choose one of: "initial" | "all" | "async"(default is async)
      //     name: "vendor", // Name of the chunk to be cached after splitting
      //     minSize: 1000,
      //     minchunks: 1,
      //     enforce: true,
      //     maxChunks: 10,
      //     test: /node_modules/,
      //     maxAsyncRequests: 1, // Maximum number of async requests, default 1
      //     maxInitialRequests: 1, // Maximum number of initial requests, default 1
      //     reuseExistingChunk: true // Can set whether to reuse this chunk (no default value found in source code)
      //   }
      // }
    }),
    function () {
      this.plugin("done", function (stats) {
        if (stats.compilation.errors && stats.compilation.errors.length) {
          console.log(stats.compilation.errors);
          process.exit(1);
        }
      });
    }
  ]
})