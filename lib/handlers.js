// Dependencies

const _data = require('./data');
const helpers = require('./helpers');

// Define all the handlers
const handlers = {};

// Ping
handlers.ping = (data, callback) => {
	callback(200);
};

// Not-Found
handlers.notFound = (data, callback) => {
	callback(404);
};

// Users
handlers.users = (data, callback) => {
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

// User - get
// Required data: phone
// Optional data: none
// @TODO Only let authed user access their own data
handlers._users.get = (data, callback) => {
	const phone =
		typeof data.queryStringObject.phone == 'string' &&
		data.queryStringObject.phone.trim().length == 10
			? data.queryStringObject.phone.trim()
			: false;
	if (phone) {
		_data.read('users', phone, (err, data) => {
			if (!err && data) {
				// remove hashed password
				delete data.hashedPassword;
				callback(200, data);
			} else {
				callback(404);
			}
		});
	} else {
		callback(400, { Error: 'Missing require field' });
	}
};

// User - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses.
handlers._users.put = (data, callback) => {
	// Check for required field
	const phone =
		typeof data.payload.phone == 'string' &&
		data.payload.phone.trim().length == 10
			? data.payload.phone.trim()
			: false;

	// Check for optional fields
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
	const password =
		typeof data.payload.password == 'string' &&
		data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false;

	// Error if phone is invalid
	if (phone) {
		// Error if nothing is sent to update
		if (firstName || lastName || password) {
			// Lookup the user
			_data.read('users', phone, (err, userData) => {
				if (!err && userData) {
					// Update the fields if necessary
					if (firstName) {
						userData.firstName = firstName;
					}
					if (lastName) {
						userData.lastName = lastName;
					}
					if (password) {
						userData.hashedPassword = helpers.hash(password);
					}
					// Store the new updates
					_data.update('users', phone, userData, (err) => {
						if (!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500, {
								Error: 'Could not update the user.',
							});
						}
					});
				} else {
					callback(400, { Error: 'Specified user does not exist.' });
				}
			});
		} else {
			callback(400, { Error: 'Missing fields to update.' });
		}
	} else {
		callback(400, { Error: 'Missing required field.' });
	}
};

// User - delete
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object.
// @TODo Cleanup data files associated with user
handlers._users.delete = (data, callback) => {
	const phone =
		typeof data.queryStringObject.phone == 'string' &&
		data.queryStringObject.phone.trim().length == 10
			? data.queryStringObject.phone.trim()
			: false;
	if (phone) {
		_data.read('users', phone, (err, data) => {
			if (!err && data) {
				_data.delete('users', phone, (err) => {
					if (!err) {
						callback(200);
					} else {
						callback(500, { Error: 'Could not delete user' });
					}
				});
			} else {
				callback(400, { Error: 'Could not find specified user' });
			}
		});
	} else {
		callback(400, { Error: 'Missing require field' });
	}
};

/*-------------------------------------------------------------------------------------------------------------------*/

// Tokens
handlers.tokens = (data, callback) => {
	const acceptableMethods = ['post', 'get', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Container for all token methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function (data, callback) {
	var phone =
		typeof data.payload.phone == 'string' &&
		data.payload.phone.trim().length == 10
			? data.payload.phone.trim()
			: false;
	var password =
		typeof data.payload.password == 'string' &&
		data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false;
	if (phone && password) {
		// Lookup the user who matches that phone number
		_data.read('users', phone, function (err, userData) {
			if (!err && userData) {
				// Hash the sent password, and compare it to the password stored in the user object
				var hashedPassword = helpers.hash(password);
				if (hashedPassword == userData.hashedPassword) {
					// If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
					var tokenId = helpers.createRandomString(20);
					var expires = Date.now() + 1000 * 60 * 60;
					var tokenObject = {
						phone: phone,
						id: tokenId,
						expires: expires,
					};

					// Store the token
					_data.create('tokens', tokenId, tokenObject, function (
						err,
					) {
						if (!err) {
							callback(200, tokenObject);
						} else {
							callback(500, {
								Error: 'Could not create the new token',
							});
						}
					});
				} else {
					callback(400, {
						Error:
							"Password did not match the specified user's stored password",
					});
				}
			} else {
				callback(400, { Error: 'Could not find the specified user.' });
			}
		});
	} else {
		callback(400, { Error: 'Missing required field(s).' });
	}
};
handlers._tokens.get = (data, callback) => {};
handlers._tokens.put = (data, callback) => {};
handlers._tokens.delete = (data, callback) => {};

// ping to test
handlers.ping = (data, callback) => {
	callback(200);
};

// not found
handlers.notFound = (data, callback) => {
	callback(404);
};

module.exports = handlers;
