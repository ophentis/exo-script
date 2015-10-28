const Koa = require('koa')
const app = new Koa()
const SandCastle = require('sandcastle').SandCastle

var sandcastle = new SandCastle()

const stream = require('stream')

// logger



app.use((ctx, next) => {
	const start = new Date
	return next().then(() => {
		const ms = new Date - start
		console.log(`${ctx.method} ${ctx.url} - ${ms}`)
	})
})

// response

app.use(ctx => {
	console.log('oh')

	var script = sandcastle.createScript("\
		exports.main = function() {\
			exit('Hey ' + name + ' Hello World!');\
		}\
	")

	ctx.set('Content-Type', 'text/plain')

	ctx.body = new stream.Readable({
		read: function(n) {
			console.log(n)
			var self = this
			// sets this._read under the hood
			script.on('exit', (err, output) => {
				console.log(output)
				console.log(self.push(output))
				console.log(self.push(null))
				// ctx.body = output
				// res.end(output); // Hello World!
			});

			script.run({name: 'Willy'}) // we can pass variables into run.
		}
	})

	// ctx.body.setEncoding('utf8');
});

app.listen(process.env.PORT || 3000);

console.log('Server running at http://exo-script.herokuapp.com');
