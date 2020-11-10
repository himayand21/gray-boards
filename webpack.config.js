
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const manifestJson = require('./public/manifest.json');

const VENDOR_LIBS = ['react', 'react-dom'];

const config = function(env) {
    const isProduction = env === 'production';
    return {
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? 'none' : 'cheap-module-eval-source-map',
        entry: {
            bundle: ['@babel/polyfill', './src/index.js'],
            vendor: VENDOR_LIBS
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/',
            // saves the output of webpack in the project directory
            filename: isProduction ? 'js/[name].[hash:8].chunk.js' : 'js/[name].js'
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    {from: './public/favicon.svg', to: './favicon.svg'},
                    {from: './public/hero.png', to: './hero.png'},
                ]
            }),
            new HtmlWebpackPlugin({
                template: './public/index.html',
                chunks: ['bundle', 'vendor'],
                favicon: './public/favicon.svg'
            }),
            new MiniCssExtractPlugin({
                filename: 'styles/[name].built.css'
            }),
            new ManifestPlugin({
                generate: () => manifestJson
            }),
            new CompressionPlugin()
        ],
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        test: /node_modules/,
                        chunks: 'initial',
                        name: 'vendor',
                        enforce: true
                    }
                }
            }
        },
        devServer: {
            contentBase: './build',
            host: '0.0.0.0',
            open: true,
            historyApiFallback: true,
            proxy: {
                '/.netlify': {
                    target: 'http://0.0.0.0:5000',
                    secure: false
                }
            }
        },
        module: {
            rules: [
                {
                    test: /.js$/,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                },
                {
                    test: /.(json)/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'file-loader',
                        options: {name: '[name].[ext]'},
                    }],
                },
                {
                    test: /.(jpg|png|webp|ogg|mp3|svg|eot|woff|woff2|ttf)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    }
                },
                {
                    test: /.(css|scss)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {loader: 'css-loader'},
                        {loader: 'sass-loader'}
                    ]
                }
            ]
        }
    };
};
module.exports = config;
