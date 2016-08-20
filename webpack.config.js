'use strict'
let webpack = require('webpack');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let HtmlResWebpackPlugin = require('html-res-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin-hash');
let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
//let AssetsPlugin = require('assets-webpack-plugin');
let HappyPack = require('happypack');
let autoprefixer = require('autoprefixer');
let path = require('path');
let glob = require('glob');


//let scriptReg = /<script.+src=[\"|\']([^\?|\s]+)\??.*[\"|\'].*><\/script>/ig;
//let styleReg = /<link.+href=[\"|\']([^\?|\s]+)\??.*[\"|\'].*>/ig;

let projectConfig = require('./project.config.json');
let srcPath = path.resolve(projectConfig.srcPath);

module.exports = function (options) {
    options = options || {};
    log('=============================================');
    log('cli options:' + JSON.stringify(options));
    let resInline = options.resinline;
    let isProd = options.prod;
    let isDll = options.dll;
    let isDllref = options.dllref;
    let isDev = !isDll && !isProd;

    let config = {
        entry: {},
        resolve: {
            alias: {}
        },
        plugins: []
    }

    log('=============================================');
    log('查找到common入口文件：');
    let commonEntryName = 'common/common';
    projectConfig.commonEntry && glob.sync(projectConfig.commonEntry, {
        cwd: srcPath
    }).forEach(function (entryPath) {
        let aliaName = path.basename(entryPath, '.entry.js');
        commonEntryName = path.dirname(entryPath) + '/' + aliaName;
        config.resolve.alias[aliaName] = entryPath;
        config.entry[commonEntryName] = [entryPath];
        log(entryPath);
    });

    log('\r\n =============================================');
    log('查找到components入口文件：');

    projectConfig.components && glob.sync(projectConfig.components, {
        cwd: srcPath
    }).forEach(function (entryPath) {
        let aliaName = path.basename(entryPath, '.entry.js');
        config.resolve.alias[aliaName] = entryPath;
        log(entryPath);
    });


    //读取page配置文件
    log('\r\n =============================================');
    log('查找到page入口文件：');
    let entryConfig = {
        inline: { // inline or not for index chunk
            js: !!resInline,
            css: !!resInline
        }
    }

    glob.sync(projectConfig.entrys, {
        cwd: srcPath
    }).forEach(function (entryPath) {
        let aliaName = path.basename(entryPath, '.entry.js');
        let entryName = path.dirname(entryPath) + '/' + aliaName;
        if (!config.resolve.alias[aliaName]) {
            config.entry[entryName] = [entryPath];
            let chunks = {
                'libs/zepto': null,
            };
            if (isDllref) {
                chunks['common/common.dll'] = null;
            }
            chunks[commonEntryName] = null;
            chunks[entryName] = entryConfig;
            //加载html生成插件
            config.plugins.push(new HtmlResWebpackPlugin({
                filename: entryName + '.html',
                template: path.join(srcPath, entryName + '.html'),
                htmlMinify: isProd ? {
                    removeComments: true,
                    collapseWhitespace: true,
                    //                removeAttributeQuotes: true
                } : false,
                chunks: chunks,
            }));
            log(entryPath);
        }
    });

    log('\r\n =============================================');

    return {
        //entry配置项的根目录（绝对路径）
        context: srcPath,
        entry: config.entry,
        output: {
            path: path.resolve(projectConfig.buildPath, isDll ? 'dll' : resInline ? 'inline' : 'link'),
            publicPath: projectConfig.publicPath,
            filename: isDll ? '[name].dll.js' : isProd ? '[name].[chunkhash:8].js' : '[name].js',
            chunkFilename: isProd ? 'chunk/[chunkhash:8].chunk.js' : 'chunk/[name].chunk.js',
            library: isDll ? 'common_dll' : null,
            //libraryTarget: 'umd',
        },
        plugins: [
            //代码中直接使用common变量，编译时会自动require('common')
        /**new webpack.ProvidePlugin({
				common: 'common'
			}),**/
            new HappyPack({
                // loaders is the only required parameter:
                loaders: ['babel?cacheDirectory&plugins[]=transform-runtime&presets[]=es2015-webpack'],
            }),
            new webpack.DefinePlugin({
                __DEBUG__: !isProd,
                __PROD__: isProd
            }),
            new CommonsChunkPlugin({
                name: commonEntryName,
                //number|Infinity|function(module, count) -> boolean
                minChunks: isDev ? 2 : Infinity
            }),
            //copy libs
            new CopyWebpackPlugin([{
                from: projectConfig.libsPath,
                to: projectConfig.libsPath
            }].concat(isDllref ? [{//dll引用
                from: path.resolve(projectConfig.buildPath, 'dll', commonEntryName + '.dll.js'),
                to: commonEntryName + '.dll.js'
            }] : []), {
                ignore: ['*.json'],
                namePattern: isProd ? '[name]-[contenthash:6].js' : '[name].js'
            })
        ].concat(config.plugins).concat(isProd ? [
            new webpack.NoErrorsPlugin(),
            new webpack.optimize.DedupePlugin(),
            //css单独打包
            new ExtractTextPlugin('[name].[contenthash:8].css')
        ] : []).concat(isDll ? [//dll打包
            new webpack.DllPlugin({
                path: path.join(projectConfig.buildPath, 'dll', '[name]-manifest.json'),
                name: "common_dll"
            })
        ] : []).concat(isDllref ? [//dll引用
            new webpack.DllReferencePlugin({
                context: srcPath,
                manifest: require(projectConfig.buildPath + 'dll/' + commonEntryName + '-manifest.json'),
                sourceType: "var",
            })
        ] : []),
        resolve: {
            // 模块查找路径：指定解析器查找模块的目录。
            // 相对路径会在每一层父级目录中查找（类似 node_modules）。
            // 绝对路径会直接查找。
            // 将按你指定的顺序查找。
            modules: [srcPath, path.resolve('node_modules')],
            extensions: ['.js', '.css', '.scss', '.json', '.html'],
            alias: config.resolve.alias //别名，配置后可以通过别名导入模块
        },
        //第三方包独立打包，用来配置无module.exports的第三方库，require('zepto')时会自动导出module.exports = Zepto;
        externals: projectConfig.externals,
        //ExtractTextPlugin导出css生成sourcemap必须 devtool: 'source-map'且css?sourceMap
        devtool: isProd ? null : 'cheap-source-map',
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
            noParse: [],
            preLoaders: isProd ? [{
                test: /\.js$/,
                loader: "jshint-loader",
                include: [srcPath]
            }] : [],
            loaders: [{
                test: /\.js$/,
                loader: 'happypack/loader',
                include: [srcPath]
            }, {
                test: /\.html$/,
                loader: 'html'
            }, {
                test: /\.scss$/,
                loader: isProd ? ExtractTextPlugin.extract({
                    fallbackLoader: "style",
                    loader: "css!postcss!sass"
                }) : 'style!css?sourceMap!postcss!sass'
            }, {
                test: /\.css$/,
                loader: isProd ? ExtractTextPlugin.extract({
                    fallbackLoader: "style",
                    loader: "css"
                }) : 'style!css'
            }, {
                test: /\.(woff|woff2|ttf|eot|svg)$/,
                loader: 'file?name=[path][name].[ext]?[hash:8]'
            }, {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: isProd ? [
                    'url?limit=8192&name=[path][name].[hash:8].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=5&interlaced=false'
                ] : ['file?name=[path][name].[ext]']
            }]
        },
        postcss: function () {
            return [autoprefixer({
                browsers: ['Android 4', 'iOS 7']
            })];
        },
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
        },
    };

    function log(msg) {
        console.log(' ' + msg);
    }
}
