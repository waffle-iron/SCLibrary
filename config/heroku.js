var config = {
	auth: { client_id: 'b784f5490df1c16b90fe1fc07d5b619d',
			client_secret: '5fd44b5e8554a0b22f0355f088033052',
			redirect_uri: 'http://sc-library.herokuapp.com/home'
		  }
}

module.exports = require('./defaults')(config);