//Create and export config vars

// Container for all the envs
const environments = {};

environments.staging = {
	httpPort: 3000,
	httpsPort: 3001,
	envName: 'staging',
	hashingSecret: 'thisIsASecret',
	maxChecks: 5
};

environments.production = {
	httpPort: 5000,
	httpsPort: 5001,
	envName: 'production',
	hashingSecret: 'thisIsASecret',
	maxChecks: 5
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
