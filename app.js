
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , spideryumPath = process.env.SPIDERYUM_PATH
  , path = require('path');

var app = express();

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

app.get(/^\/(.*)/, function(req, res, next){
  var pathString, pathArray;
  if (req.query.type === 'static') {
    next();
  } else {
      pathString = req.params[0] || '';
      pathArray = pathString.split('/');    
      console.log(pathString);
      console.log(path.join(spideryumPath, pathString));
      fs.stat(path.join(spideryumPath, pathString), function(err, stats) {
          if (err || stats.isFile()) {
            next();
          } else if (stats.isDirectory) {
              fs.readdir(path.join(spideryumPath, pathString), function(err, files) {
                  if (err) {
                  } else {
                      files.sort();
                      res.render('index', { path: pathString, files: files });
                  }              
              });
          }
      });
  }
});

app.get('/upload', function(req, res) {
  res.render('upload');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
