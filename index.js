var http = require('http');

var SandCastle = require('sandcastle').SandCastle;

var sandcastle = new SandCastle();

var script = sandcastle.createScript("\
  exports.main = function() {\
    exit('Hey ' + name + ' Hello World!');\
  }\
");

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  script.on('exit', function(err, output) {
	res.end(output); // Hello World!
  });

  script.run({name: 'Willy'}); // we can pass variables into run.

}).listen(process.env.PORT || 3000);

console.log('Server running at http://exo-script.herokuapp.com');
