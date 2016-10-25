module.exports = {
  output: {
    filename: 'project.js'
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
