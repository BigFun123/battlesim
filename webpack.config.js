const path = require('path');
const fs = require('fs');

// webpack is a bundler, it bundles all the files into one file
module.exports = {
    entry: './src/index.js',
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
      },
    output: {
        path: path.join(__dirname, 'public'), // where to put the bundled file
        filename: 'bundle.js' // the name of the bundled file
    },
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, 'public'), // where to serve the files from
        historyApiFallback: true // this is for react router
    },
    resolve: {
        extensions: [".jsx", ".js", ".json"],
    },
    module: {
        rules: [
            {
                test: /\.js$/, // for all js files
                exclude: /node_modules/, // exclude node_modules                
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}