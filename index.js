// Primary file for API

// Dependencies
const http = require('http');
const url = require('url');

// The server should respond to all request with a string
const server = http.createServer((req, res) => {
	// Get url and parse
	const parsedUrl = url.parse(req.url, true);

	// Get path to url
	const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    
    // Get query string as object
    var queryStringObject = parsedUrl.query;

	// Get http method
	const method = req.method.toUpperCase();

	// Send response
	res.end('Hello World\n');
	// Log path requested
	console.log(
		`<---------->\nRequest path: ${trimmedPath}\nMethod: ${method}`
    );
    console.log(
        'Query String Object: ', queryStringObject, '\n<---------->\n'
    );
});

// Start the server, and have it listen on port 3000
server.listen(3000, () => {
	console.log('Listening on 3000....');
});
