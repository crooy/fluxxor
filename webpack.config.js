var webpack = require("webpack");

module.exports = {
  cache: true,
  entry: "./index.js",
  output: {
    path: __dirname + "/build",
    filename: "fluxxor.js",
    library: "Fluxxor",
    libraryTarget: "umd"
  },
  devtool: "source-map",
  plugins:[    
    new webpack.optimize.OccurrenceOrderPlugin()
  ],
  module: {
    loaders: [
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.json$/, loader: "json" }
    ]
  }
};
