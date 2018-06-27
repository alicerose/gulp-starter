import sample from './sample.js';
sample();

var textUpdate = function(text){
  $('section p').text(text);
}
textUpdate('jquery test');