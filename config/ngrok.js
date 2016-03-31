var config = {
	base_url: 'http://0a9526d8.ngrok.io',
	auth: { client_id: '5d5e30bae0d0e71ed80bda5bff8496bf',
			client_secret: 'b29624846bf9d5c5dbe592fcde55b2f3',
			redirect_uri: 'http://0a9526d8.ngrok.io/home'
		  }
}

module.exports = require('./defaults')(config);

