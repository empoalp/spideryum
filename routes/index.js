
/*
 * GET home page.
 */

var path = require('path');

exports.index = function(req, res){
  pathArray = req.params[0].split('/');
  res.render('index', { title: 'Express' });
};
