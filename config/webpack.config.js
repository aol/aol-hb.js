const config = require('./config');

module.exports = {
  output: {
    filename: config.outputFileName
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        include: /(src|test)/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
