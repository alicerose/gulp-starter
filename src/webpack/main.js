import $ from 'jquery';
import { SOME_NUMBER } from 'CONSTANTS/common';
import { exportHoge } from 'CONTROLLERS/test';

exportHoge(SOME_NUMBER);
const text = $('header h1').text();
alert(text);
console.log('hogehogehoge');
