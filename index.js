// Primary file for API
/*
Steps:
1. Dependencies: http, string_decoder, url
2. Create server using http.CreateServer method which requires req, res 
3. Get url and parse (url.parse) which takes, req.url
4. Get the pathname using parsedUrl.pathname
5. Get pathname (trimmed using path.replace("^\/+|\/+$/g, '')
6. If there's a query string, parse using parsedUrl.query
7. Capture method with req.method
8. Capture headers with req.headers
9. Decode payload, if any (new StringDecoder('utf-8))
10. Create buffer var with empty string
11. TODO
*/
// cmd to create keys: openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
// place in /https


// Dependencies
const http = require('http');
const { StringDecoder } = require('string_decoder');
const url = require('url');
const config = require('./config');

// The server should respond to all request with a string
const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);

	const path = parsedUrl.pathname;

	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	var queryStringObject = parsedUrl.query;

	const method = req.method.toUpperCase();
	const headers = req.headers;

	// Get the payload, if any
	const decoder = new StringDecoder('utf-8');

	let buffer = '';
	req.on('data', (data) => {
		buffer += decoder.write(data);
	});
	req.on('end', () => {
		buffer += decoder.end();
		// Choose handler req should go to; if not found, use 'notFound' handler
		let chosenHandler =
			typeof router[trimmedPath] !== 'undefined'
				? router[trimmedPath]
				: handlers.notFound;

		// Construct data object to send to handler
		let data = {
			trimmedPath: trimmedPath,
			queryStringObject: queryStringObject,
			method: method,
			headers: headers,
			paylod: buffer,
		};

		//Route req to handler specified in router
		chosenHandler(data, (statusCode, payload) => {
			statusCode = typeof statusCode === 'number' ? statusCode : 200;

			payload = typeof payload == 'object' ? payload : {};

			let payloadString = JSON.stringify(payload);

			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);
			console.log('Returning this response: ', statusCode, payloadString);
		});

		// Send response

		// Log path requested
		// console.log('Request received with this payload: ', buffer);
	});
});

// Start the server
server.listen(config.port, () => {
	console.log(`Listening on ${config.port}\nEnvironment: ${config.envName}`);
});

// Handlers
let handlers = {};

// Sample handler
handlers.sample = (data, cb) => {
	// Cb http status code and payload obj
	cb(406, { name: 'sample handler' });
};

// Not found handler
handlers.notFound = (data, cb) => {
	cb(404);
};

// Request router
const router = {
	sample: handlers.sample,
};
