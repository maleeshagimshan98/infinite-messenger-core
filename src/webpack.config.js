const path = require('path');


module.exports = {
  mode: "development",
  entry: './MessengerCore.js',
  output: {
    filename: 'MessengerCore.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget : 'var',
    //libraryExport: 'default',
    library : 'MessengerCore',
  },
  module : {
      rules: [
        {
        test : /\.js/,
        exclude : [
          path.resolve(__dirname,"node_modules")
        ],
        // rules for modules (configure loaders, parser options, etc.)
        use :   {
          loader: "babel-loader",
          // the loader which should be applied, it'll be resolved relative to the context
          options: {
            presets: [["@babel/preset-env", {
              useBuiltIns: "usage",
              corejs: 3, // or 2,
            }]
          ],
          sourceType : "unambiguous"
        },
      },
    },    
  ]
},
plugins : [],
devtool : "eval-cheap-module-source-map",
devServer : {
  contentBase : './',
  hot : true,
},
};