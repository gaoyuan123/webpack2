'use strict'
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlResWebpackPlugin = require('html-res-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin-hash');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
//let AssetsPlugin = require('assets-webpack-plugin');
const HappyPack = require('happypack');
const autoprefixer = require('autoprefixer');
const path = require('path');
const glob = require('glob');


const config = {
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
const entryConfig = {
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

function log(msg) {
	console.log(' ' + msg);
}

module.exports = {
  // click on the name of the option to get to the detailed documentation
  // click on the items with arrows to show more examples / advanced options
  
  context: __dirname, // string (absolute path!)
  // the home directory for webpack
  // the entry and module.rules.loader option
  //   is resolved relative to this directory
  
  entry: "./app/entry", // string | object | array
  entry: ["./app/entry1", "./app/entry2"],
  entry: {
    a: "./app/entry-a",
    b: ["./app/entry-b1", "./app/entry-b2"]
  },
  // Here the application starts executing
  // and webpack starts bundling

  output: {
    // options related to how webpack emits results

    path: path.resolve(__dirname, "dist"), // string
    // the target directory for all output files
    // must be an absolute path (use the Node.js path module)

    filename: "[name].[chunkhash:8].js", // for long term caching
    // the filename template for entry chunks
	
    chunkFilename: "chunk/[chunkhash:8].js", // for long term caching
    // the filename template for additional chunks
	
	
    publicPath: "/assets/", // string
    // the url to the output directory resolved relative to the HTML page

    library: "MyLibrary", // string,
    // the name of the exported library

    libraryTarget: "umd", // universal module definition
        /* libraryTarget: "umd2", // universal module definition
        libraryTarget: "commonjs2", // exported with module.exports
        libraryTarget: "commonjs-module", // exports with module.exports
        libraryTarget: "commonjs", // exported as properties to exports
        libraryTarget: "amd", // defined with AMD defined method
        libraryTarget: "this", // property set on this
        libraryTarget: "var", // variable defined in root scope
        libraryTarget: "assign", // blind assignment
        libraryTarget: "window", // property set to window object
        libraryTarget: "global", // property set to global object
        libraryTarget: "jsonp", // jsonp wrapper */
    // the type of the exported library

    /* Advanced output configuration (click to show) */

    pathinfo: true, // boolean
    // include useful path info about modules, exports, requests, etc. into the generated code

    

    jsonpFunction: "myWebpackJsonp", // string
    // name of the JSONP function used to load chunks

    sourceMapFilename: "[file].map", // string
    sourceMapFilename: "sourcemaps/[file].map", // string
    // the filename template of the source map location

    devtoolModuleFilenameTemplate: "webpack:///[resource-path]", // string
    // the name template for modules in a devtool

    devtoolFallbackModuleFilenameTemplate: "webpack:///[resource-path]?[hash]", // string
    // the name template for modules in a devtool (used for conflicts)

    umdNamedDefine: true, // boolean
    // use a named AMD module in UMD library

    crossOriginLoading: "use-credentials", // enum
    //crossOriginLoading: "anonymous",
    //crossOriginLoading: false,
    // specifies how cross origin request are issued by the runtime

    /* Expert output configuration (on own risk) */

    devtoolLineToLine: {
      test: /\.js$/
    },
    // use a simple 1:1 mapped SourceMaps for these modules (faster)

    hotUpdateMainFilename: "[hash].hot-update.json", // string
    // filename template for HMR manifest

    hotUpdateChunkFilename: "[id].[hash].hot-update.js", // string
    // filename template for HMR chunks

    sourcePrefix: "\t", // string
    // prefix module sources in bundle for better readablitity
  },

  module: {
    // configuration regarding modules

    rules: [
      // rules for modules (configure loaders, parser options, etc.)

    {
		enforce: 'pre',
		test: /\.js?$/,
		use: ['jshint-loader'],
		include: [srcPath]
	},{
		test: /\.js$/,
		use: ['babel-loader?cacheDirectory&presets[]=es2015&plugins[]=transform-runtime'],
		include: [srcPath]
	}, {
		test: /\.html$/,
		use: ['html-loader']
	}, {
		test: /\.scss$/,
		use:ExtractTextPlugin.extract({
			fallbackLoader: "style-loader",
			use: ['css-loader','postcss-loader','sass-loader']
		})
	}, {
		test: /\.css$/,
		use: ExtractTextPlugin.extract({
			fallbackLoader: "style-loader",
			use: ['css-loader']
		})
	}, {
		test: /\.(woff|woff2|ttf|eot|svg)$/,
		use: ['file-loader?name=[path][name].[ext]?[hash:8]']
	}, {
		test: /\.(jpe?g|png|gif)$/i,
		use:[{
			loader: 'url-loader',
			options:{
				limit:8192,
				name:'[path][name].[hash:8].[ext]'
			}
		},{
			loader: 'image-webpack-loader',
			options:{
				bypassOnDebug:true,
				optimizationLevel:5,
				interlaced:false
			}
		}]
	}

      //{ oneOf: [ /* rules */ ] },
      // only use one of these nested rules

      //{ rules: [ /* rules */ ] },
      // use all of these nested rules (combine with conditions to be useful)

      //{ resource: { and: [ /* conditions */ ] } },
      // matches only if all conditions are matched

      //{ resource: { or: [ /* conditions */ ] } },
      //{ resource: [ /* conditions */ ] }
      // matches if any condition is matched (default for arrays)

      //{ resource: { not: /* condition */ } }
      // matches if the condition is not matched
    ],

    /* Advanced module configuration (click to show) */

    /* 
	noParse: [
      /special-library\.js$/
    ], 
	*/
    // do not parse this module

    unknownContextRequest: ".",
    unknownContextRecursive: true,
    unknownContextRegExp: /^\.\/.*$/,
    unknownContextCritical: true,
    exprContextRequest: ".",
    exprContextRegExp: /^\.\/.*$/,
    exprContextRecursive: true,
    exprContextCritical: true,
    wrappedContextRegExp: /.*/,
    wrappedContextRecursive: true,
    wrappedContextCritical: false,
    // specifies default behavior for dynamic requests
  },

  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)

    modules: [
      [srcPath, path.resolve('node_modules')],
    ],
    // directories where to look for modules

    extensions: ['.js', '.css', '.scss', '.json', '.html'],
    // extensions that are used

    alias: {
      // a list of module name aliases

      "module": "new-module",
      // alias "module" -> "new-module" and "module/path/file" -> "new-module/path/file"

      "only-module$": "new-module",
      // alias "only-module" -> "new-module", but not "module/path/file" -> "new-module/path/file"

      "module": path.resolve(__dirname, "app/third/module.js"),
      // alias "module" -> "./app/third/module.js" and "module/file" results in error
      // modules aliases are imported relative to the current context
    },
    /* alternative alias syntax (click to show) */
    alias: [
      {
        name: "module",
        // the old request

        alias: "new-module",
        // the new request

        onlyModule: true
        // if true only "module" is aliased
        // if false "module/inner/path" is also aliased
      }
    ],

    /* Advanced resolve configuration (click to show) */

    symlinks: true,
    // follow symlinks to new location

    descriptionFiles: ["package.json"],
    // files that are read for package description

    mainFields: ["main"],
    // properties that are read from description file
    // when a folder is requested

    aliasFields: ["browser"],
    // properites that are read from description file
    // to alias requests in this package

    enforceExtension: false,
    // if true request must not include an extensions
    // if false request may already include an extension

    moduleExtensions: ["-module"],
    enforceModuleExtension: false,
    // like extensions/enforceExtension but for module names instead of files

    unsafeCache: true,
    unsafeCache: {},
    // enables caching for resolved requests
    // this is unsafe as folder structure may change
    // but performance improvement is really big

    cachePredicate: (path, request) => true,
    // predicate function which selects requests for caching

    plugins: [
      // ...
    ]
    // additional plugins applied to the resolver
  },

  /* 
  performance: {
    hints: "warning", // enum
    hints: "error", // emit errors for perf hints
    hints: false, // turn off perf hints
    maxAssetSize: 200000, // int (in bytes),
    maxEntrypointSize: 400000, // int (in bytes)
    assetFilter: function(assetFilename) { 
      // Function predicate that provides asset filenames
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  }, 
  */

 /*  
  devtool: "source-map", // enum
  devtool: "inline-source-map", // inlines SourceMap into orginal file
  devtool: "eval-source-map", // inlines SourceMap per module
  devtool: "hidden-source-map", // SourceMap without reference in original file
  devtool: "cheap-source-map", // cheap-variant of SourceMap without module mappings
  devtool: "cheap-module-source-map", // cheap-variant of SourceMap with module mappings
  devtool: "eval", // no SourceMap, but named modules. Fastest at the expense of detail.  
  */
  // enhance debugging by adding meta info for the browser devtools
  // source-map most detailed at the expense of build speed.

  

  target: "web", // enum
  target: "webworker", // WebWorker
  target: "node", // Node.js via require
  target: "async-node", // Node.js via fs and vm
  target: "node-webkit", // nw.js
  target: "electron-main", // electron, main process
  target: "electron-renderer", // electron, renderer process
  target: (compiler) => { /* ... */ }, // custom
  // the environment in which the bundle should run
  // changes chunk loading behavior and available modules

  externals: ["react", /^@angular\//],
  externals: "react", // string (exact match)
  externals: /^[a-z\-]+($|\/)/, // Regex
  externals: { // object
    angular: "this angular", // this["angular"]
    react: { // UMD
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React"
    }
  },
  externals: (request) => { /* ... */ return "commonjs " + request }
  // Don't follow/bundle these modules, but request them at runtime from the environment

  stats: "errors-only",
  stats: { //object
    assets: true,
    colors: true,
    errors: true,
    errorDetails: true,
    hash: true,
    // ...
  },
  // lets you precisely control what bundle information gets displayed

  plugins: [
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
	}], {
		namePattern: isProd ? '[name]-[contenthash:6].js' : '[name].js'
	}),
	//css单独打包
	new ExtractTextPlugin({
		filename:'[name].[contenthash:8].css'
	}),
	new webpack.LoaderOptionsPlugin({
		test: /\.scss$/, // may apply this only for some modules
		options: {
			postcss:[autoprefixer({
				browsers: ['Android 4', 'iOS 7']
			})]
	   }
	}),
	
	new webpack.LoaderOptionsPlugin({
		test: /\.js$/, // may apply this only for some modules
		options: {
		 jshint:{
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
	
			
  ],
  // list of additional plugins


  /* Advanced configuration (click to show) */

  resolveLoader: { /* same as resolve */ }
  // separate resolve options for loaders

  profile: true, // boolean
  // capture timing information

  bail: true, //boolean
  // fail out on the first error instead of tolerating it.

  cache: true, // boolean
  // disable/enable caching

  recordsPath: path.resolve(__dirname, "build/records.json"),
  recordsInputPath: path.resolve(__dirname, "build/records.json"),
  recordsOutputPath: path.resolve(__dirname, "build/records.json"),
  // TODO

}