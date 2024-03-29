
/*global $:false, document:false, FileReader:false */

(function() {

"use strict";

$(function() {
  var fileTable = document.getElementById('file-table');
  fileTable.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();

    var file = e.dataTransfer.files[0]
      , data = new FormData();
    
    data.append('file', file);

    $.ajax({
      url: '/upload/?path=',
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: function() {
        window.location = '/';
      }
    });

  }, false);

  $('#file-table a').on('dragstart', function(e) {
    var dt = e.originalEvent.dataTransfer;
    var downUrl = 'application/octet-stream:' + $(this).html() + ':http://localhost:3000' + $(this).attr('href');
    dt.setData("DownloadURL", downUrl); 
  });
});

})();
