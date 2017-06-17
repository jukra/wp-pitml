//jquery.paste_image_reader.js for handling the clipboard paste
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

//Uploading logic for WP
//Mimics the original upload process (plupload)
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
    //Upload success response handling
    XHR.onreadystatechange = function() {
      if (XHR.readyState === 4) {
        // Generate attributes for a new `Attachment` model.
        var result = JSON.parse(XHR.response)
        var file = result.data;
        var attributes = _.extend({
          uploading: false,
          date:      new Date(),
          filename:  file.name,
          menuOrder: 0,
          uploadedTo: wp.media.model.settings.post.id,
        }, _.pick( file, 'loaded', 'size', 'percent' ) );
        //Is there a smarter way to do this without ES6 Object.assign()?
        for (var prop in file) {
            if (file.hasOwnProperty(prop)) {
                attributes[prop] = file[prop];
            }
        }
        // Handle early mime type scanning for images.
        var image = /(?:jpe?g|png|gif)$/i.exec( file.name );
        // For images set the model's type and subtype attributes.
        if ( image ) {
          attributes.type = 'image';
          // `jpeg`, `png` and `gif` are valid subtypes.
          // `jpg` is not, so map it to `jpeg`.
          attributes.subtype = ( 'jpg' === image[0] ) ? 'jpeg' : image[0];
        }
        // Create a model for the attachment and add it to queue in order for it to show in the backbone collection
        file.attachment = wp.media.model.Attachment.create( attributes );
        wp.Uploader.queue.add(file.attachment);
      }
    }
    // Define what happens in case of error
    XHR.addEventListener('error', function(event) {
      //TODO Error handling
    });
    // Set up our request
    XHR.open('POST', _wpPluploadSettings.defaults.url);
    // Send our FormData object (form submission)
    XHR.send(FD);
  });
})(jQuery);