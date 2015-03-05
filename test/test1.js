

var config = {
	db : 
		{
		credentials : {
			host				: "10.0.0.104",
			user 				: "root",
			password 			: "root",
			database 			: "advantage"
		}
	}
}


var TrafficCounter = require('../traffic_counter');

var tc = new TrafficCounter(config);
tc.run(function(){
	// let's test localized configured account
	// tc.add(100001, 'sms_sent', 10, 'UP8');

	// // let's test UTC configured account

	var d = {
			 account_id		: 200001,
			 transaction	: 'sms_api',
			 code			: 'sent',
			 count			: 20,
			 user_id 		: 1,
			 timezone		: 'GMT',
	};

	tc.add(d);	

	var dd = {
			 account_id		: 200001,
			 transaction	: 'sms_api',
			 code			: 'delivered',
			 count			: 100,
			 user_id 		: 1,
			 timezone		: 'Asia/Manila',
	};

	tc.add(dd);	


});
