// Primary file for API

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
	
	let queryStringObject = parsedUrl.query;

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
	});
});

// Start the server
server.listen(config.port, () => {
	console.log(`Listening on ${config.port}\nEnvironment: ${config.envName}`);
});

let handlers = {};

handlers.sample = (data, cb) => {
	// Cb http status code and payload obj
	cb(406, { name: 'sample handler' });
};

handlers.notFound = (data, cb) => {
	cb(404);
};

const router = {
	sample: handlers.sample,
};
