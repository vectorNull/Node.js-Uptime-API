// Primary file for API

// Dependencies
const http = require('http');
const url = require('url');

// The server should respond to all request with a string
const server = http.createServer((req, res) => {
	// Get url and parse
	const parsedUrl = url.parse(req.url);

	// Get path to url
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');
	// console.log('trimmed path ----> ', trimmedPath)

	// Send response
	res.end('Hello World\n');
	// Log path requested
	console.log(`Request received on path: ${trimmedPath}`);
});

// Start the server, and have it listen on port 3000
server.listen(3000, () => {
	console.log('Listening on 3000....');
});
