/*
 * Request Handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define all the handlers
const handlers = {};

// Ping
handlers.ping = function (data, callback) {
	callback(200);
};

// Not-Found
handlers.notFound = function (data, callback) {
	callback(404);
};

// Users
handlers.users = function (data, callback) {
	const acceptableMethods = ['post', 'get', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Container for all the users methods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
	// Check that all required fields are filled out
	const firstName =
		typeof data.payload.firstName == 'string' &&
		data.payload.firstName.trim().length > 0
			? data.payload.firstName.trim()
			: false;
	const lastName =
		typeof data.payload.lastName == 'string' &&
		data.payload.lastName.trim().length > 0
			? data.payload.lastName.trim()
			: false;
	const phone =
		typeof data.payload.phone == 'string' &&
		data.payload.phone.trim().length == 10
			? data.payload.phone.trim()
			: false;
	const password =
		typeof data.payload.password == 'string' &&
		data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false;
	const tosAgreement =
		typeof data.payload.tosAgreement == 'boolean' &&
		data.payload.tosAgreement == true
			? true
			: false;

	if (firstName && lastName && phone && password && tosAgreement) {
		// Make sure the user doesnt already exist
		_data.read('users', phone, (err, data) => {
			if (err) {
				// Hash the password
				const hashedPassword = helpers.hash(password);

				// Create the user object
				if (hashedPassword) {
					const userObject = {
						firstName: firstName,
						lastName: lastName,
						phone: phone,
						hashedPassword: hashedPassword,
						tosAgreement: true,
					};

					// Store the user
					_data.create('users', phone, userObject, (err) => {
						if (!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500, {
								Error: 'Could not create the new user',
							});
						}
					});
				} else {
					callback(500, {
						Error: "Could not hash the user's password.",
					});
				}
			} else {
				// User alread exists
				callback(400, {
					Error: 'A user with that phone number already exists',
				});
			}
		});
	} else {
		callback(400, { Error: 'Missing required fields' });
	}
};

handlers._users.get = (data, callBack) => {};

handlers._users.put = (data, callBack) => {};

handlers._users.delete = (data, callBack) => {};

/*-------------------------------------------------------------------------------------------------------------------*/

// ping to test
handlers.ping = (data, callBack) => {
	callBack(200);
};

// not found
handlers.notFound = (data, callBack) => {
	callBack(404);
};

module.exports = handlers;
