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


// Dependencies
const http = require('http');
const { StringDecoder } = require('string_decoder');
const url = require('url');
const config = require('./config');

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
	;
	// Get the headers as an object
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
		let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct data object to send to handler
		let data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'paylod': buffer
		};

		//Route req to handler specified in router
		chosenHandler(data, (statusCode, payload) => {
			// Use the status code called back by the handler, or default to 200
			statusCode = typeof(statusCode) === 'number' ? statusCode : 200
			// Use the payload called back by the handler, or default to an empty obj
			payload = typeof(payload) == 'object' ? payload : {};
			//Convert payload to sting
			let payloadString = JSON.stringify(payload);
			// Return res
			res.setHeader('Content-Type', 'application/json');
			res. writeHead(statusCode);
			res.end(payloadString);
			console.log('Returning this response: ', statusCode, payloadString)
		})

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
	cb(406, {'name': 'sample handler'});
};

// Not found handler
handlers.notFound = (data, cb) => {
	cb(404);
};

// Request router
const router = {
	sample: handlers.sample,
};
