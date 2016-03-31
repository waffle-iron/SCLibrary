var environment = process.env.ENV;
console.log('Environment: ' + environment);

if(environment === 'prod'){
    config = require('./config/prod.js');
}else if(environment === 'dev'){
    config = require('./config/dev.js');
}else if(environment === 'heroku'){
    config = require('./config/heroku.js');
}else if(environment === 'local'){
    config = require('./config/local.js');
}else if(environment === 'ngrok'){
    config = require('./config/ngrok.js');
}

module.exports = config;
