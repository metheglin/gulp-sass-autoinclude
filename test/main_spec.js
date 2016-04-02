var gutil = require("gulp-util"),
    gulp = require("gulp"),
    autoinclude = require("../"),
    through2 = require("through2"),
    libpath = require("path");
    // fs = require("fs"),
    // should = require("chai").should();

describe("test", function(){

  var check = function(options){
    return gulp.src(libpath.join(__dirname, "fixtures", "_mixin.scss"))
      .pipe( autoinclude(options) )
  }

  it("check1", function(done){
    gulp.src( libpath.join(__dirname, "fixtures", "_mixin.scss") )
      .pipe( autoinclude({
        mixin_prefix: "inc--",
        output_filename: "_test.scss" 
      }))
      .pipe( gulp.dest( libpath.join(__dirname, "output" )));

    done();
  });

  it("check2", function(done){
    // var contents = fs.readFileSync(
    //   libpath.join(__dirname, "expected", "_custom.css")
    // ).toString();
    check({}).pipe(through2.obj(function(newFile, enc, cb){
      // should.exist(newFile);
      // should.exist(newFile.contents);
      // contents.should.eql(newFile.contents.toString());
      console.log(newFile.contents.toString())
      cb();
      done();
    }));
  });

});