module.exports = function() {
    let ExtractTextPlugin = require('extract-text-webpack-plugin');
    return [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        },
        {
            test: /\.hbs/,
            loader: 'handlebars-loader'
        },
        {
            test: /\.(jpe?g|png|gif|svg|)$/i,
            loader: 'file-loader?name=img/[name].[ext]'
        },
        {
            test: /\.(eot|ttf|woff|woff2)$/,
            loader: 'file-loader?name=fonts/[name].[ext]'
        },
        {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: ['css-loader', 'sass-loader']
            })
          }
    ];
};
