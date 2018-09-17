(function(){
  'use strict';
  var canvas = window.Basic.SetupCanvas(document.querySelector('#basicForm'));
  document.querySelector('#execute').addEventListener('click', function() {
    window.Basic.Interpret(document.querySelector('#command').value, canvas);
  });
}());