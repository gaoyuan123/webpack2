'use strict'
const path = require('path');
const glob = require('glob');
const projectConfig = require('./project.config.json');
const srcPath = path.resolve(projectConfig.srcPath);

const config = module.exports = {
    srcPath: srcPath,
    buildPath: projectConfig.buildPath,
    publicPath: projectConfig.publicPath,
    libsPath: projectConfig.libsPath,
    externals: projectConfig.externals,
    commonEntry: 'common/common',
    entry: {},
    resolve: {
        alias: {}
    },
}

log('=============================================');
log('查找到common入口文件：');
projectConfig.commonEntry && glob.sync(projectConfig.commonEntry, {
    cwd: srcPath
}).forEach(function (entryPath) {
    let aliaName = path.basename(entryPath, '.entry.js');
    config.commonEntry = path.dirname(entryPath) + '/' + aliaName;
    config.resolve.alias[aliaName] = entryPath;
    config.entry[config.commonEntry] = [entryPath];
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

glob.sync(projectConfig.entrys, {
    cwd: srcPath
}).forEach(function (entryPath) {
    let aliaName = path.basename(entryPath, '.entry.js');
    let entryName = path.dirname(entryPath) + '/' + aliaName;
    if (!config.resolve.alias[aliaName]) {
        config.entry[entryName] = [entryPath];
        log(entryPath);
    }
});

log('\r\n =============================================');

function log(msg) {
    console.log(' ' + msg);
}
