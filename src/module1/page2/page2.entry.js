if(__DEBUG__)require('./page2.html');
import './style.scss';
import helloModel,{name,age} from './model.js';
import template from './_list.html';
import helloCommon,{test} from 'common';
import sidebar from 'sidebar';
console.log('model.name:',name);
console.log('model.age:',age);
helloCommon();
helloModel();
console.log('template:',template);
console.log('common.test:',test);

$(()=>{
	$(document.body).append(template);
});
document.addEventListener('click',() =>{
	require(['sidebar','dropdownMenu'],(sidebar,dropdownMemu)=>{
		console.log('sidebar',sidebar);
		console.log('dropdownMenu',dropdownMemu);
	});
});


