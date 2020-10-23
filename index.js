// Primary file for API

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers')

let app = {}

// Init function
app.init = () => {
	// Start server
	server.init();

	// Start workers
	workers.init();
}

app.init();



module.exports = app;