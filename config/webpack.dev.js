const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge');
const webpackConfigBase = require('./webpack.base')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const os = require('os');
let selfIp;
try {
  selfIp = os.networkInterfaces()['WLAN'][1].address;
} catch (e) {
  selfIp = 'localhost'
}

const PORT = 3333
function resolve(relatedPath) {
  return path.join(__dirname, relatedPath)
}
const webpackConfigDev = {
  mode: 'development',
  plugins: [
    // Define environment variable as development
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      IS_DEVELOPMETN: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  optimization: {
    minimize: false,
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            comments: false
          },
          compress: {
            warnings: false,
            drop_debugger: true,
            drop_console: true
          }
        }
      })
    ]
  },
  devtool: 'source-map',
  devServer: {
    contentBase: resolve('/public/dist'),
    historyApiFallback: {
      rewrites: [
        { from: /^\/*/, to: '/public/index.html' }
      ]
    },
    open: true,
    hot: true,
    host: selfIp,
    port: PORT,
    proxy: {
      '/api2/*': {// Proxy request prefix
        target: 'https://10.10.10.46:8006/',// Proxy server path
        secure: false,
        changeOrigin: true,
        ws: true
        //changeOrigin: true,
        //pathRewrite: {'^/api' : ''}// Whether to rewrite path after reaching server
      },
      '/shell/*': {// Proxy request prefix
        target: 'https://10.10.10.46:8006/',// Proxy server path
        secure: false,
        changeOrigin: true,
        pathRewrite: { '/shell/': '/' }// Whether to rewrite path after reaching server
      },
      '/xtermjs/*': {
        target: 'https://10.10.10.46:8006/',// Proxy server path
        secure: false,
        changeOrigin: true,
        ws: true
      },
      '/novnc/*': {
        target: 'https://10.10.10.46:8006/',// Proxy server path
        secure: false,
        changeOrigin: true
      },
      '/vncwebsocket': {
        target: 'wss://10.10.10.46:8006/',// Proxy server path
        secure: false,
        ws: true,
        pathRewrite: { 'wss://localhost:3333/': 'wss://10.10.10.46:8006/' },
        changeOrigin: true
      },
      '/pve-docs/*': {
        target: 'https://10.10.10.46:8006/',// Proxy server path
        secure: false,
        ws: true,
        changeOrigin: true
      }
    }
  },
}

module.exports = merge(webpackConfigBase, webpackConfigDev);
