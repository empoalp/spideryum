
/*jshint laxcomma: true, es5: true */

/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , formidable = require('formidable')
  , http = require('http')
  , spideryumPath = process.env.SPIDERYUM_PATH || __dirname
  , step = require('step')
  , path = require('path');

var app = express();

// Custom file upload middleware
app.use(fileUpload);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(spideryumPath));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.delete(/^\/(.*)/, function(req, res, next){
  var pathString, pathArray, filePath;
  pathString = req.params[0] || '';
  pathArray = pathString.split('/');    
  filePath = path.join(spideryumPath, pathString);
  fs.stat(filePath, function(err, stats) {
    if (!err && stats.isFile()) {
      fs.unlink(filePath, function(err) {
        if (!err) {
          res.redirect('/');    
        }
      });
    }
  });
});

function getFileList(dirPath, cb) {

  step(
    function readDir() {
      fs.readdir(dirPath, this);
    },
    function getFileStats(err, files) {
      var filePaths = this.group()
        , stats = this.group();

      this.parallel().call(this, null, files);

      files.forEach(function(file) {
        var filePath = path.join(dirPath, file);
        fs.stat(filePath, stats());
        filePaths()(null, file);
      });
    },
    function returnFileObjects(err, files, stats) {
      var fileObjects = [];
      files.forEach(function(file, i) {
        fileObjects.push({
          name: file,
          type: getFileType(stats[i], file)
        });
      });
      cb(err, fileObjects);
    }
  );

}

var fileTypes = {
  '.png': 'image'
};

function getFileType(stats, fileName) {
  if (stats.isDirectory()) {
    return 'directory';
  } else if (stats.isFile()) {
    return fileTypes[path.extname(fileName)] || 'file';
  }
}

app.get(/^\/(.*)/, function(req, res, next){
  var pathString, pathArray;
  if (req.query.type === 'static') {
    next();
  } else {
      pathString = req.params[0] || '';
      pathArray = pathString.split('/');    
      fs.stat(path.join(spideryumPath, pathString), function(err, stats) {
          if (err || stats.isFile()) {
            next();
          } else if (stats.isDirectory()) {
            getFileList(path.join(spideryumPath, pathString), function(err, files) {
              res.render('index', { path: pathString, files: files });
            });
              /*fs.readdir(path.join(spideryumPath, pathString), function(err, files) {
                  if (err) {
                  } else {
                      files.sort();
                      res.render('index', { path: pathString, files: files });
                  }              
              });*/
          }
      });
  }
});

app.get('/upload', function(req, res) {
  res.render('upload', { path: req.query.path });
});


function fileUpload(req, res, next) {
  var form = new formidable.IncomingForm();

  // ignore GET, HEAD
  if ('GET' == req.method || 'HEAD' == req.method) return next();
  // check Content-Type
  if (!req.is('multipart/form-data')) return next();

  form.on('progress', function(received, total) {
    console.log('progress', received/total*100);
  });
 
  form.on('file', function(name, file) {
    fs.readFile(file.path, function (err, data) {
      var filePath = path.join(spideryumPath, req.query.path) + '/' + file.name;
      fs.writeFile(filePath, data, function(err) {
        res.redirect(req.query.path);
      });
    });
  });

  form.keepExtensions = true;
  form.uploadDir = '/tmp';
  form.parse(req);
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("SpiderYum listening on port " + app.get('port'));
});
