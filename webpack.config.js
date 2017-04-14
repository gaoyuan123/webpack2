'use strict'
const path = require('path');
const glob = require('glob');

const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlResWebpackPlugin = require('html-res-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin-hash');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
//const AssetsPlugin = require('assets-webpack-plugin');
const HappyPack = require('happypack');
const autoprefixer = require('autoprefixer');

const projectConfig = require('./config/project.config');

//const scriptReg = /<script.+src=[\"|\']([^\?|\s]+)\??.*[\"|\'].*><\/script>/ig;
//const styleReg = /<link.+href=[\"|\']([^\?|\s]+)\??.*[\"|\'].*>/ig;

const srcPath = path.resolve(projectConfig.srcPath);

module.exports = function (env) {
    env = env || {};
    console.log('=============================================');
    console.log('cli options:' + JSON.stringify(env));
    const resInline = env.resinline;
    const isProd = env.prod;
    const isHappy = env.isHappy;
    const isDev = !isProd;

    const entryConfig = {
        inline: { // inline or not for index chunk
            js: !!resInline,
            css: !!resInline
        }
    }

    const htmlPlugins = [];
    Object.keys(projectConfig.entry).forEach(function (entryName) {
        var templatePath = path.join(srcPath, entryName + '.html');
        if(!glob.sync(templatePath).length){
            return;
        }
        let chunks = {
            'libs/zepto': null,
        };
        chunks[projectConfig.commonEntry] = null;
        chunks[entryName] = entryConfig;
        //加载html生成插件
        htmlPlugins.push(new HtmlResWebpackPlugin({
            filename: entryName + '.html',
            template: templatePath,
            htmlMinify: isProd ? {
                removeComments: true,
                collapseWhitespace: true,
                //                removeAttributeQuotes: true
            } : false,
            chunks: chunks,
        }));
    });

    return {
        //entry配置项的根目录（绝对路径）
        context: srcPath,
        entry: projectConfig.entry,
        output: {
            path: path.resolve(projectConfig.buildPath, resInline ? 'inline' : 'link'),
            publicPath: projectConfig.publicPath,
            filename: isProd ? '[name].[chunkhash:8].js' : '[name].js',
            chunkFilename: isProd ? 'chunk/[chunkhash:8].chunk.js' : 'chunk/[name].chunk.js',
            library: '',
            //libraryTarget: 'umd',
        },
        plugins: [
            //代码中直接使用common变量，编译时会自动require('common')
        /**new webpack.ProvidePlugin({
				common: 'common'
			}),**/
            //new webpack.NoErrorsPlugin(),
            new webpack.DefinePlugin({
                __DEBUG__: !isProd,
                __PROD__: isProd
            }),
            new CommonsChunkPlugin({
                name: projectConfig.commonEntry,
                //number|Infinity|function(module, count) -> boolean
                minChunks: isDev ? 2 : Infinity
            }),
            //copy libs
            new CopyWebpackPlugin([{
                from: projectConfig.libsPath,
                to: projectConfig.libsPath
            }], {
                namePattern: isProd ? '[name]-[contenthash:6].js' : '[name].js'
            })
        ].concat(htmlPlugins).concat(isProd ? [
            //css单独打包
            new ExtractTextPlugin({
                filename: '[name].[contenthash:8].css'
            }),
            new webpack.LoaderOptionsPlugin({
                test: /\.scss$/, // may apply this only for some modules
                options: {
                    postcss: [autoprefixer({
                        browsers: ['Android 4', 'iOS 7']
                    })]
                }
            }),

            new webpack.LoaderOptionsPlugin({
                test: /\.js$/, // may apply this only for some modules
                options: {
                    jshint: {
                        esversion: 6,
                        // any jshint option http://www.jshint.com/docs/options/
                        // i. e.
                        camelcase: true,

                        // jshint errors are displayed by default as warnings
                        // set emitErrors to true to display them as errors
                        emitErrors: false,

                        // jshint to not interrupt the compilation
                        // if you want any file with jshint errors to fail
                        // set failOnHint to true
                        failOnHint: false,
                        asi: true,
                        boss: true,
                        curly: true,
                        expr: true,
                        //        undef: true,
                        unused: true
                    }
                }
            })

        ] : []).concat(isHappy ? [new HappyPack({
            // loaders is the only required parameter:
            loaders: ['babel-loader?cacheDirectory&presets[]=es2015-webpack' + (isProd ? '&plugins[]=transform-runtime' : '')],
        })] : []),
        resolve: {
            // 模块查找路径：指定解析器查找模块的目录。
            // 相对路径会在每一层父级目录中查找（类似 node_modules）。
            // 绝对路径会直接查找。
            // 将按你指定的顺序查找。
            modules: [srcPath, path.resolve('node_modules')],
            extensions: ['.js', '.css', '.scss', '.json', '.html'],
            alias: projectConfig.resolve.alias //别名，配置后可以通过别名导入模块
        },
        //第三方包独立打包，用来配置无module.exports的第三方库，require('zepto')时会自动导出module.exports = Zepto;
        externals: projectConfig.externals,
        //ExtractTextPlugin导出css生成sourcemap必须 devtool: 'source-map'且css?sourceMap
        devtool: isProd ? '' : 'cheap-source-map',
        //server配置
        devServer: {
            //contentBase: srcPath,
            headers: {
                "Cache-Control": "no-cache"
            },
            stats: {
                colors: true,
            },
            host: '0.0.0.0',
            port: 8000
        },
        module: {
            rules: [{
                test: /\.js$/,
                use: [isHappy ? 'happypack/loader' : 'babel-loader?cacheDirectory&presets[]=es2015-webpack' + (isProd ? '&plugins[]=transform-runtime' : '')],
                include: [srcPath]
            }, {
                test: /\.html$/,
                use: ['html-loader']
            }, {
                test: /\.scss$/,
                use: isProd ? ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                }) : ['style-loader', 'css-loader?sourceMap', 'postcss-loader', 'sass-loader']
            }, {
                test: /\.css$/,
                use: isProd ? ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader']
                }) : ['style-loader', 'css-loader']
            }, {
                test: /\.(woff|woff2|ttf|eot|svg)$/,
                use: ['file-loader?name=[path][name].[ext]?[hash:8]']
            }, {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: isProd ? [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: '[path][name].[hash:8].[ext]'
                    }
                }, {
                    loader: 'image-webpack-loader',
                    options: {
                        bypassOnDebug: true,
                        optimizationLevel: 5,
                        interlaced: false
                    }
                }] : [{
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                        optimizationLevel: 5,
                        interlaced: false
                    }
                }]
            }].concat(isProd ? [{
                enforce: 'pre',
                test: /\.js?$/,
                use: ['jshint-loader'],
                include: [srcPath]
            }] : [])
        }
    };

}
