# SCLibrary
SCLibrary is a library interface for SoundCloud, making use of the SoundCloud API in order to provide an iTunes-like interface for browsing, sorting, and making playlists out of your SoundCloud favorites.

## Dependencies

Download and install the following software:

1. [Git](https://git-scm.com/downloads)

2. [Node.js](https://nodejs.org/en/download/)

3. [Neo4j Server](http://neo4j.com/)

4. Redis Server

    - [Windows](https://github.com/MSOpenTech/redis/releases/tag/win-2.8.2400)

    - [Mac & Linux](http://redis.io/download)
    
    - Ubuntu   
            ```bash
            sudo apt-get install redis-server
            ```

## Setup

Download the project:

```bash
$ git clone https://github.com/mimen/SCLibrary.git SCLibrary
```

Install dependencies:

```bash
$ npm install
$ bower install
```

Launch the Neo4j desktop application and click Start. Navigate to the URL given (http://localhost:7474) and follow the instructions to configure the server.

Sign up for a [SoundCloud API key](http://soundcloud.com/you/apps).

Create a config folder in the main directory. Inside, create the file "local.js".
Copy and paste this code and fill in the necessary info.


```javascript
var config = {
	base_url: 'http://localhost:3000/',
	auth: { client_id: 'YOUR_CLIENT_ID',
			client_secret: 'YOUR_CLIENT_SECRET',
			redirect_uri: 'http://localhost:3000/home'
		  },
  	redis_secret : MAKE_YOUR_OWN_SECRET,
	neo4j_href : 'http://YOUR_USERNAME:YOUR_PASSWORD@localhost:7474'
}
module.exports = config;
```

Navigate to the home directory and launch node:

```bash
$ npm start
```

Navigate to http://localhost:3000.