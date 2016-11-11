const config = require('./config');
const path = require('path');

module.exports = {
  output: {
    filename: config.outputFileName
  },

  resolve: {
    root: [
      path.resolve('./'),
      path.resolve('./src'),
      path.resolve('./node_modules')
    ],
    modulesDirectories: ['node_modules', 'src', 'config']
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        include: /(src|tests)/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
