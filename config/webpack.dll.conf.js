const path = require('path')
const webpack = require('webpack')
const package = require('../package.json')
module.exports = {
  entry: {
    // Read dependencies from package.json, exclude normalize.css as it causes build errors
    // If using Chrome's vue-devtool, also exclude vue during build, as minified vue doesn't work with vue-devtool
    vendor: Object.keys(package.dependencies).filter((item) => {
      return item.indexOf('normalize') < 0 && item != 'vue'
    })
  },
  output: {
    path: path.join(__dirname, '../public/dist/static'),
    filename: 'dll.[name]_[hash:6].js',
    library: '[name]_[hash:6]'
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, '../', '[name]-manifest.json'),
      name: '[name]_[hash:6]'
    })
  ]
}