(function() {
	"use strict";

	var TrafficCounter = function(c)
	{
		var self 			= this;

		var moment          = require('moment-timezone');
		var sys             = require('util');
		var mysql           = require('mysql');


		var mc_pool			= mysql.createPool(c.db.credentials);

		self.timezones 		= [];
		self.transactions 	= [];
		self.codes 			= [];
		self.account_timezone = {};
		self.status 		= false;


		self.insert_query   		= c.insert_query || "INSERT into account_transaction_counter set ? ON DUPLICATE KEY update count = count + VALUES(count) ";
		self.get_account_query 		= c.get_account_query || "select * from vw_account_api where account_id = ?";

		self.errors 			= {
			'ER001' 	: "Account not found",
		}

		self.init = function(callback)
		{
			// get the timezone

			self.get_timezones(function(err){
				self.get_transactions(function(err){
					self.get_codes(function(err){
						callback(err);
					});
				});	
			});	
		}

		self.run = function(callback)
		{
			self.init(function(err){
				if(err)
				{
					console.log("Can't run", err);
				}
				else
				{
					self.status = true;

					console.log("Running");
				}

				callback(self.status);
			});
		}

		self.get_timezones = function(callback)
		{
			self.get_master_data('timezone',self.timezones, 'name', 'id', function(err){
				callback(err);
			});
		}

		self.get_transactions = function(callback)
		{
			self.get_master_data('transaction',self.transactions, 'code', 'id', function(err){
				callback(err);
			});
		}

		self.get_codes = function(callback)
		{
			self.get_master_data('dashboard_code',self.codes, 'code', 'id', function(err){
				callback(err);
			});
		}

		self.get_master_data = function(table_name, object, key, value, callback)
		{
			mc_pool.query("SELECT * from " + table_name, function(err, rows){
	        	if (err) { throw err; }

	        	for(var i = 0 ; i < rows.length; i++)
		        {
		          var v = rows[i];

		          object[v[key]] = v[value];
		        }

		        console.log(table_name, "retrieved",object);


				callback();
			});
		
		}

		self.add = function(d)
		{
			console.log("ADD request", d);



			d['transaction_id'] = self.transactions[d.transaction];
			d['timezone_id']  	= self.timezones[d.timezone];
			d['code_id'] 		= self.codes[d.code];

			// make sure there is a timezone
			if(!d.timezone)
			{
				console.log("No timezone, let's get it");

				// get the timezone of the account

				self.get_account_timezone(account_id, function(err, t){
					if(err) throw err;

					d['timezone_name']  = t.timezone_name;

					self.add_local(d, self.add_now_done);
				});
			}
			else
			{
				console.log("timezone is given", d.timezone);

				
				d['timezone_name']  = d.timezone;
				

				// no checking here. this will fail if the timezone name is invalid

				self.add_local(d, self.add_now_done);
			}

			d.date = moment().format('YYYY-MM-DD');

			self.add_now(d, self.add_now_done);

		}

		self.add_now_done = function(err, d)
		{
			console.log("ADD", err, d);
		}

		self.add_local = function(d)
		{
			if(d.timezone_name == 'GMT')
			{
				//do nothing
			}
			else
			{
				// is this a valid timezone

				// var date_local = self.get_date_local(timezone_name);

				d.date = moment().tz(d.timezone_name).format('YYYY-MM-DD');


				self.add_now(d,  self.add_now_done);
			}

		}


		self.get_account_timezone = function(account_id, callback)
		{	

			// check if it's in the local memory now

			if(self.account_timezone[account_id])
			{
				callback(self.account_timezone[account_id]);
			}

			mc_pool.query(self.get_account_query, { account_id : account_id }, function(err, rows, fields){
				if(err) throw err;

				if(rows[0])
				{
					// save it into the local mem
					self.account_timezone[account_id] = rows[0];

					callback(null, rows[0]);	
				}
				else
				{
					callback(self.errors['ERR001']);
				}

				
			});
		}

		self.add_now = function(d, callback)
		{
			// we need the current data in UTC
			// environment date should be in UTC

			var p = {
				transaction_id 		: d.transaction_id,
				account_id 			: d.account_id,
				code_id 			: d.code_id,
				timezone_id 		: d.timezone_id,
				user_id 			: d.user_id,
				count 				: d.count,
				date 				: d.date
			}

			console.log(p);


			mc_pool.query(self.insert_query, p, function(err, rows, fields){
				if(err) throw err;

				callback(null, rows);
			});
		}
	}

	module.exports = TrafficCounter;
})();