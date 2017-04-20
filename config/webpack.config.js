const config = require('./config');
const path = require('path');
const StringReplacePlugin = require('string-replace-webpack-plugin');

module.exports = {
  output: {
    filename: config.outputFileName
  },

  resolve: {
    root: [path.resolve('./')],
    modulesDirectories: ['node_modules', 'src', 'config']
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.resolve('./src'),
          path.resolve('./tests')
        ],
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }, {
        test: /\.js$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /\$\$AOLHB_GLOBAL\$\$/g,
              replacement: function() {
                return config.globalNamespace;
              }
            }
          ]
        })
      }
    ],
    plugins: [
      new StringReplacePlugin()
    ]
  }
};
