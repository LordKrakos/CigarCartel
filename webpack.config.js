const path = require('path');

module.exports = {
    entry: [
        './storelocator/static/storelocator/js/index.js',
        './storelocator/static/storelocator/js/map.js'
    ],
    output: {
        filename: 'bundle.js', // All code will be bundled into one file called bundle.js
        path: path.resolve(__dirname, 'storelocator/static/storelocator/js/')
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    devtool: 'source-map',
    mode: 'development'
};