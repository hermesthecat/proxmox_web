const webpack = require('webpack');
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HappyPack = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const manifest = require('../vendor-manifest.json');
// Split third-party libraries and inject them into HTML
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const os = require('os');
// Enable multi-threading
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

function resolve(dirname) {
  return path.resolve(__dirname, dirname);
}
const isDevMode = process.env.NODE_ENV === 'development' ? true : false;
module.exports = {
  mode: isDevMode ? 'development' : 'production',
  context: path.resolve(__dirname, '../'),
  entry: {
    'pve': [resolve('../node_modules/babel-polyfill/dist/polyfill.js'), resolve('../src/main.js')]
  },
  output: {
    publicPath: isDevMode ? '/public/' : '/',
    path: path.resolve(__dirname, '../public/dist'),
    filename: isDevMode ? 'js/[name].[hash:8].js' : 'mhflex/js/[name].[hash:8].js',
    chunkFilename: isDevMode ? 'js/[name].[hash:8].js' : 'mhflex/js/[name].[hash:8].js',
  },
  module: {
    unknownContextCritical: false,
    rules: [{
      test: /\.(js)$/,
      loader: 'happypack/loader?id=happyBabel',
    }, {
      test: /\.(vue)$/,
      loader: 'vue-loader'
    }, {
      test: /\.(c|le)ss$/,
      use: [
        'vue-style-loader',
        !isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            importLoaders: 2, // Previous 2 loaders
            //modules: true, // Enable CSS Modules
            sourceMap: isDevMode ? true : false
          }
        },
        {
          loader: 'postcss-loader'
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
          }
        }
      ]
    }, {
      test: /\.(png|jpg|svg|jpeg|gif)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            name: 'images/[name].[hash:4].[ext]',
            esModule: false,
          }
        }
      ]
    }, {
      test: /\.(woff|eot|ttf|woff2)$/,
      loader: 'url-loader',
      options: {
        limit: 8192,
        name: isDevMode ? 'font/[name].[hash:4].[ext]' : 'mhflex/font/[name].[hash:4].[ext]',
        esModule: false
      }
    },
    {
      test: /\.md$/,
      use: [
        {
          loader: 'vue-loader'
        },
        {
          loader: 'vue-markdown-loader/lib/markdown-compiler',
          options: {
            raw: true
          }
        }
      ]
    }]
  },
  resolve: {
    extensions: ['.js', '.vue', '.less', '.css'],
    alias: {
      "@view": resolve("../src/views/"),
      "@images": resolve("../src/assets/"),
      "@libs": resolve("../src/libs/"),
      "@src": resolve("../src/"),
      "vue$": 'vue/dist/vue.esm.js',
      "@static": resolve('../public/')
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: isDevMode ? 'css/[name].[hash:16].css' : '/mhflex/css/[name].[hash:16].css'
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    }),
    new HappyPack({
      id: 'happyBabel',
      loaders: [{
        loader: 'babel-loader',
        include: [
          resolve('../src'),
          resolve('../node_modules/element-ui/src'),
          resolve('../node_modules/element-ui/packages'),
          resolve('../node_modules/ace-builds'),
        ],
        options: {
          babelrc: true,
          cacheDirectory: true, // Enable caching
          comments: false
        }
      }],
      // Represents a shared process pool, where multiple HappyPack instances use the same shared process pool's child processes to handle tasks,
      // preventing excessive resource usage
      threadPool: happyThreadPool,
      // Allow HappyPack to output logs
      verbose: false,
    }),
    new HappyPack({
      id: 'happyVue',
      loaders: [{
        loader: 'vue-loader',
        options: {
          babelrc: true,
          cacheDirectory: true // Enable caching
        }
      }],
      // Represents a shared process pool, where multiple HappyPack instances use the same shared process pool's child processes to handle tasks,
      // preventing excessive resource usage
      threadPool: happyThreadPool,
      // Allow HappyPack to output logs
      verbose: false
    }),
    new HappyPack({
      id: 'happyStyle',
      loaders: [
        {
          loader: 'css-loader',
          options: {
            importLoaders: 2, // Previous 2 loaders
            //modules: true, // Enable CSS Modules
            sourceMap: isDevMode ? true : false
          }
        },
        {
          loader: 'postcss-loader',
          exclude: /node_modules/
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: true,
          }
        }
      ],
      // Represents a shared process pool, where multiple HappyPack instances use the same shared process pool's child processes to handle tasks,
      // preventing excessive resource usage
      threadPool: happyThreadPool,
      // Allow HappyPack to output logs
      verbose: false,
    }),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname),
      manifest
    }),
    new HtmlWebpackPlugin({
      template: resolve("../public/index.html"),
      filename: "index.html",
      minify: false,
      inject: true
    }),
    new AddAssetHtmlPlugin({
      filepath: path.resolve(__dirname, '../public/dist/static/dll.vendor_*.js'),
    })
  ]
}
