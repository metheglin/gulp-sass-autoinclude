var through2  = require("through2"),
  _           = require("lodash"),
  gutil       = require("gulp-util"),
  decomment   = require('decomment');

const PLUGIN_NAME = 'gulp-sass-autoinclude';

module.exports = function (param) {
  "use strict";
  // if necessary check for required param(s), e.g. options hash, etc.
  if (!param) {
    param = {};
  }
  var options =  _.defaults(
    param,
    {
      output_filename: "_auto_include.scss",
      mixin_prefix: "inc--",
      tag_template: {
        pc: "@media screen and (min-width: 641px) {\n$content$\n}",
        sp: "@media screen and (max-width: 640px) {\n$content$\n}"
      }
    }
  );

  var store = {};
  // see "Writing a plugin"
  // https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md
  function process(file, enc, callback) {

    // Do nothing if no contents
    if (file.isNull()) {
      return callback();
    }
    if (file.isStream()) {
      this.emit("error",
        new gutil.PluginError(PLUGIN_NAME, "Stream content is not supported"));
      return callback();
    }
    // check if file.contents is a `Buffer`
    if (file.isBuffer() || file.isFile()) {
      var file_text = decomment.text( file.contents.toString(), {safe:true} );
      file_text.split("\n").forEach(function(line){
        var regex = new RegExp("\@mixin\\s+(" + options.mixin_prefix + "[0-9a-zA-Z\-_]+)");
        var m = line.match( regex )
        if ( m ) {
          var mixin_name = m[1].trim();
          // Remove prefix
          var class_name = mixin_name.replace(new RegExp("^"+options.mixin_prefix), "");
          // Recognize tags
          var tags = class_name.split('__');
          class_name = tags.shift();
          var mixin_data = {
            mixin_name: mixin_name,
            class_name: class_name,
            tags: tags 
          };
          tags.forEach(function(t){
            if ( ! store[t] ) { store[t] = []; }
            store[t].push( mixin_data );
          })
        }
      });

      var output_list = [];

      _.forIn( store, function(mixins, tag){
        var include_sentences = "";
        mixins.forEach(function(m){
          include_sentences += "." + m.class_name + " { @include " + m.mixin_name + "; }\n";
        })
        var out = include_sentences;
        var template = options.tag_template[tag];
        if ( template ) {
          out = template.replace('$content$', include_sentences);
        }
        output_list.push( out );
      });
      var txt = output_list.join("\n");
      this.push(new gutil.File({
        base: "",
        path: options.output_filename,
        contents: new Buffer(txt)
      }));
    }

    return callback();
  }

  return through2.obj( process );
};
