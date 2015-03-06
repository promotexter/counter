var config = require('./config');

var TrafficCounter = require('../traffic_counter');

var tc = new TrafficCounter({ db :  config.db.credentials } );

tc.run(function(){
	run_tests();
});


function run_tests()
{

	var d = {
			 account_id		: 2,
			 transaction	: 'bsms',
			 code			: 'sent',
			 value			: 40.1,
			 user_id 		: 1
	};

	tc.add(d);	

	var dd = {
			 account_id		: 6,
			 transaction	: 'sms_api',
			 code			: 'delivered',
			 value			: 200.1,
			 user_id 		: 1,
			 timezone		: 'Asia/Manila',
	};

	tc.add(dd);

	var dd = {
			 account_id		: 6,
			 transaction	: 'bsms',
			 code			: 'delivered',
			 value			: 200.1,
			 user_id 		: 1,
			 timezone		: 'Asia/Manila',
	};

	tc.add(dd);
}