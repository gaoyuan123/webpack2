import './style.scss';
import sayHello,{name,age} from './model.js';
import template from './_list.html';
import common from 'common';

console.log('model.name:',name);
console.log('model.age:',age);
sayHello();
console.log('template:',template);
console.log('common:',common);

$(()=>{
	$(document.body).append(template);
});
document.addEventListener('click',() =>{
	require(['sidebar','dropdownMenu'],(sidebar,dropdownMemu)=>{
		console.log('sidebar',sidebar);
		console.log('dropdownMenu',dropdownMemu);
	});
});

	
