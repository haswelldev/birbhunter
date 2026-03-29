const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'www'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './templates/index.html',
      filename: 'index.html',
      inject: 'body',
      scriptLoading: 'defer', // Defer script loading for better performance and consistency
      templateParameters: {
        cordova: '<script type="text/javascript" src="cordova.js"></script>'
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
        { from: 'css', to: 'css' },
        { from: 'img', to: 'img' },
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'favicon.ico', to: 'favicon.ico', noErrorOnMissing: true },
        { from: 'templates/cordova.js', to: 'cordova.js' },
        { from: 'platforms/browser/www/platform.js', to: 'platform.js', noErrorOnMissing: true },
        { from: 'platforms/browser/www/confighelper.js', to: 'confighelper.js', noErrorOnMissing: true },
        { from: 'platforms/browser/www/exec.js', to: 'exec.js', noErrorOnMissing: true },
      ],
    }),
  ],
  externals: {
    cordova: 'cordova',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors~main',
          chunks: 'all',
          enforce: true,
          filename: '[name].[contenthash].js'
        }
      }
    }
  }
};
