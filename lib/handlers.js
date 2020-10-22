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
handlers._users.get = (data, callback) => {
	const phone =
		typeof data.queryStringObject.phone == 'string' &&
		data.queryStringObject.phone.trim().length == 10
			? data.queryStringObject.phone.trim()
			: false;
	if (phone) {
		// Get token from the headerss
		let token =
			typeof data.headers.token == 'string' ? data.headers.token : false;
		// Verify given token is valid for phone number
		handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
			if (tokenIsValid) {
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
				callback(403, {
					Error:
						'Missing required token in header, or token is invalid',
				});
			}
		});
	} else {
		callback(400, { Error: 'Missing require field' });
	}
};

// User - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
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
			let token =
				typeof data.headers.token == 'string'
					? data.headers.token
					: false;
			// Verify given token is valid for phone number
			handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
				if (tokenIsValid) {
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
								userData.hashedPassword = helpers.hash(
									password,
								);
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
							callback(400, {
								Error: 'Specified user does not exist.',
							});
						}
					});
				} else {
					callback(403, {
						Error:
							'Missing required token in header, or token is invalid',
					});
				}
			});
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
		let token =
			typeof data.headers.token == 'string' ? data.headers.token : false;
		// Verify given token is valid for phone number
		handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
			if (tokenIsValid) {
				_data.read('users', phone, (err, data) => {
					if (!err && data) {
						_data.delete('users', phone, (err) => {
							if (!err) {
								callback(200);
							} else {
								callback(500, {
									Error: 'Could not delete user',
								});
							}
						});
					} else {
						callback(400, {
							Error: 'Could not find specified user',
						});
					}
				});
			} else {
				callback(403, {
					Error:
						'Missing required token in header, or token is invalid',
				});
			}
		});
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

// Tokens - get
// Required data: id
// Options data: none
handlers._tokens.get = (data, callback) => {
	const id =
		typeof data.queryStringObject.id == 'string' &&
		data.queryStringObject.id.trim().length == 20
			? data.queryStringObject.id.trim()
			: false;
	if (id) {
		_data.read('tokens', id, (err, tokenData) => {
			if (!err && tokenData) {
				// remove hashed password
				callback(200, tokenData);
			} else {
				callback(404);
			}
		});
	} else {
		callback(400, { Error: 'Missing require field' });
	}
};

// Tokens = put
// Required data: id, extend
// Optional Data: none
handlers._tokens.put = function (data, callback) {
	var id =
		typeof data.payload.id == 'string' &&
		data.payload.id.trim().length == 20
			? data.payload.id.trim()
			: false;
	var extend =
		typeof data.payload.extend == 'boolean' && data.payload.extend == true
			? true
			: false;
	if (id && extend) {
		// Lookup the existing token
		_data.read('tokens', id, function (err, tokenData) {
			if (!err && tokenData) {
				// Check to make sure the token isn't already expired
				if (tokenData.expires > Date.now()) {
					// Set the expiration an hour from now
					tokenData.expires = Date.now() + 1000 * 60 * 60;
					// Store the new updates
					_data.update('tokens', id, tokenData, function (err) {
						if (!err) {
							callback(200);
						} else {
							callback(500, {
								Error:
									"Could not update the token's expiration.",
							});
						}
					});
				} else {
					callback(400, {
						Error:
							'The token has already expired, and cannot be extended.',
					});
				}
			} else {
				callback(400, { Error: 'Specified user does not exist.' });
			}
		});
	} else {
		callback(400, {
			Error: 'Missing required field(s) or field(s) are invalid.',
		});
	}
};

handlers._tokens.delete = (data, callback) => {
	const id =
		typeof data.queryStringObject.id == 'string' &&
		data.queryStringObject.id.trim().length == 20
			? data.queryStringObject.id.trim()
			: false;
	if (id) {
		_data.read('tokens', id, (err, data) => {
			if (!err && data) {
				_data.delete('tokens', id, (err) => {
					if (!err) {
						callback(200);
					} else {
						callback(500, { Error: 'Could not delete tokens' });
					}
				});
			} else {
				callback(400, { Error: 'Could not find specified token' });
			}
		});
	} else {
		callback(400, { Error: 'Missing require field' });
	}
};

// Verfify if token id is currently valid for current user
handlers._tokens.verifyToken = (id, phone, callback) => {
	_data.read('tokens', id, (err, tokenData) => {
		if (!err && tokenData) {
			if (!err && tokenData) {
				if (
					tokenData.phone == phone &&
					tokenData.expires > Date.now()
				) {
					callback(true);
				} else {
					callback(false);
				}
			}
		} else {
			callback(false);
		}
	});
};

// ping to test
handlers.ping = (data, callback) => {
	callback(200);
};

// not found
handlers.notFound = (data, callback) => {
	callback(404);
};

module.exports = handlers;
