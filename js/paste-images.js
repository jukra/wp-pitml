// Based on jquery.paste_image_reader.js
(function($) {
  var defaults;
  $.event.fix = (function(originalFix) {
    return function(event) {
      event = originalFix.apply(this, arguments);
      if (event.type.indexOf('copy') === 0 || event.type.indexOf('paste') === 0) {
        event.clipboardData = event.originalEvent.clipboardData;
      }
      return event;
    };
  })($.event.fix);
  defaults = {
    callback: $.noop,
    matchType: /image.*/
  };
  return $.fn.pasteImageReader = function(options) {
    if (typeof options === "function") {
      options = {
        callback: options
      };
    }
    options = $.extend({}, defaults, options);
    return this.each(function() {
      var $this, element;
      element = this;
      $this = $(this);
      return $this.bind('paste', function(event) {
        var clipboardData, found;
        found = false;
        clipboardData = event.clipboardData;
        return Array.prototype.forEach.call(clipboardData.types, function(type, i) {
          var file, reader;
          if (found) {
            return;
          }
          if (type.match(options.matchType) || clipboardData.items[i].type.match(options.matchType)) {
            file = clipboardData.items[i].getAsFile();
            reader = new FileReader();
            reader.onload = function(evt) {
              return options.callback.call(element, {
                dataURL: evt.target.result,
                event: evt,
                file: file,
                name: file.name
              });
            };
            reader.readAsDataURL(file);
            return found = true;
          }
        });
      });
    });
  };
})(jQuery);

(function($) {
  $("html").pasteImageReader(function(results) {
    var fileObj = results.file;
    var XHR = new XMLHttpRequest();
    var FD  = new FormData();
    //Generate the request similar to traditional upload
    FD.append("name", "clipboard.png");
    FD.append("action", "upload-attachment");
    FD.append("_wpnonce", _wpPluploadSettings.defaults.multipart_params._wpnonce);
    FD.append("async-upload", fileObj);
    // Define what happens on successful data submission
    XHR.addEventListener('load', function(event) {
      //TODO Add new attachment to backbone view
    });
    // Define what happens in case of error
    XHR.addEventListener('error', function(event) {
    });
    // Set up our request
    XHR.open('POST', '/wp-admin/async-upload.php');
    // Send our FormData object (form submission)
    XHR.send(FD);
  });
})(jQuery);