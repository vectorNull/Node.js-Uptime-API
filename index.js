// Primary file for API

// cmd to create keys: openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
// place in /https

// Dependencies
const http = require('http');
const { StringDecoder } = require('string_decoder');
const url = require('url');
const https = require('https');
const fs = require('fs');
const config = require('./config');
const { callbackify } = require('util');

// Instantiate HTTP server
const httpServer = http.createServer((req, res) => {
	unifiedServer(req, res);
});

// Instantiate HTTPS server
const httpsServerOptions = {
	key: fs.readFileSync('./https/key.pem'),
	cert: fs.readFileSync('./https/cert.pem'),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
	unifiedServer(req, res);
});
// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
	console.log(`Listening on ${config.httpsPort}`);
});

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
	console.log(`Listening on ${config.httpPort}`);
});

let unifiedServer = (req, res) => {
	const parsedUrl = url.parse(req.url, true);

	const path = parsedUrl.pathname;

	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	let queryStringObject = parsedUrl.query;

	const method = req.method.toUpperCase();

	const headers = req.headers;

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
};

let handlers = {};

handlers.ping = (data, cb) => {
	cb(200);
}

handlers.notFound = (data, cb) => {
	cb(404);
};

const router = {
	ping: handlers.ping,
};
