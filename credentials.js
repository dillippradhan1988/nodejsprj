module.exports = {
	cookieSecret: 'fsdhfkdsfhksfheireroehrrewfks',
	gmail: {
        user: 'dillippradhan1988@gmail.com',
        password: 'dkppuja23$',
    },
    meadowlarkSmtp: {
        user: '',
        password: '',
    },
    mongo: {
		development: {
			connectionString: 'mongodb://nodemongoprejdb:*ei7676Iq#@ds011913.mlab.com:11913/nodejsprj',
		},
		production: {
			//connectionString: 'mongodb://<nodemongoprejdb>:<*ei7676Iq#>@ds011913.mlab.com:11913/nodejsprj',
			connectionString: 'mongodb://nodemongoprejdb:*ei7676Iq#@ds011913.mlab.com:11913/nodejsprj',
		},
	},//27017
	authProviders: {
		facebook: {
			development: {
				appId: '1250629668282306',
				appSecret: '031da6aa6a8deb83eeceab853569d674',
			},
		},
	}
};