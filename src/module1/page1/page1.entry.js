if(__DEBUG__)require('./page1.html');
require('./style.scss');
var $ = require('zepto');
var model = require('./model.js');
var template = require('./_list.html');
var common = require('common');
require('sidebar');
console.log('model:',model);
console.log('template:',template);
console.log('common:',common);
//console.log('test:',test);

$(function(){
	$(document.body).append(template);
});
document.addEventListener('click',function() {
    require(['sidebar', 'dropdownMenu'], function (sidebar, dropdownMemu) {
        console.log('sidebar', sidebar);
        console.log('dropdownMenu', dropdownMemu);
    });
});
