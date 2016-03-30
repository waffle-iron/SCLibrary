var environment = process.env.ENV;
console.log('Environment: ' + environment);

if(environment === 'prod'){
    config = require('./config/prod.js');
}else if(environment === 'dev'){
    config = require('./config/dev.js');
}

module.exports = config;
