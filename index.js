'use strict';

// var config  = require('config');
var http    = require('http')
var express = require('express')
var cors = require('cors')
// var gulp    = require('gulp');
// var gutil   = require('gulp-util');
// var morgan  = require('morgan');

var server = express()

// log all requests to the console
// server.use(morgan('dev'));
// server.use(express.static('/build'))

app.use(cors())

server.use('/api/:cik/',function(req, res) {

	if( !req.params.cik ) res.status(403).end()

	call(req.params.cik, function(e,data) {
		if( e ) {
			res.status(403).send(e)
		} else {
			console.log(data)
			var response = {
				btn: JSON.parse(data[0].result[0][1]),
				tmp: JSON.parse(data[1].result[0][1]),
			}
			res.send(response)
		}
	})

	function call(cik, cb) {

		var payload = JSON.stringify({
			auth: {cik: cik},
			calls: [{
				id: 1,
				procedure: 'read',
				arguments: [{alias:'btn'},{}]
			},{
				id: 2,
				procedure: 'read',
				arguments: [{alias:'tmp'},{}]
			}]
		})

		var httpOpt = {
			hostname: 'm2.exosite.com',
			port: 80,
			path: '/onep:v1/rpc/process',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': payload.length
			}
		}

		// process.nextTick(function() {
			var req = http.request(httpOpt,function(res) {
				res.setEncoding('utf8')
				var response = []
				res.on('data',function(chunk) {
					response.push(chunk);
				})
				res.on('end',function() {
					if( res.statusCode != 200 ) {
						if( res.statusCode == 502 ) {
							console.log('bad gateway')
						}
						return cb(res.statusMessage+' ('+res.statusCode+')\n'+req.rawHeaders,res)
					}
					try {
						response = response.join('')
						response = JSON.parse(response)
					} catch(e) {
						return cb(e,res)
					}
					cb(null,response)
				})
			})
			req.on('error',function(e) {
				// console.log(e)
				onep.emit('error',e)
				cb(e)
			})
			req.write(payload)
			req.end()
	}

})

// Start webserver if not already running
var s = http.createServer(server);
s.on('error', function(err){
	if(err.code === 'EADDRINUSE'){
		gutil.log('Development server is already started at port ' + config.serverPort);
	}
	else {
		throw err;
	}
});

s.listen(process.env.PORT || 3000);
