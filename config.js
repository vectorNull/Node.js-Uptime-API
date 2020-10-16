//Create and export config vars

// Container for all the envs
const environments = {};

environments.staging = {
	port: 3000,
	envName: 'staging',
};

environments.production = {
	port: 5000,
	envName: 'production',
};

const currenEnvironment =
	typeof process.env.NODE_ENV == 'string'
		? process.env.NODE_ENV.toLowerCase()
		: '';
const environmentToExport =
	typeof environments[currenEnvironment] == 'object'
		? environments[currenEnvironment]
		: environments.staging;

module.exports = environmentToExport;