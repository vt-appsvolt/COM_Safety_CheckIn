var timeFormatterSettings = {
	pattern: 'MM/D/YY h:mma'
};

var timeFormatter = {
		getMomentDate: function( data ){
			data.pattern = data.pattern || timeFormatterSettings.pattern;
			try{
				var timezone = data.timezone || moment.tz.guess();
				return moment.tz( data.date, data.pattern, timezone );
			}catch( ieErr ){
				return moment( data.date, data.pattern );
			}
		},
		getMomentFullDate: function( data ){
			try{
				var timezone = data.timezone || moment.tz.guess();
				return moment.tz( data.date, timezone );
			}catch( ieErr ){
				return moment( data.date );
			}
		},
		formatDate: function( data ){
			//var _moment = moment( data.date );
			data.pattern = data.pattern || timeFormatterSettings.pattern;
			try{
				var timezone = data.timezone || moment.tz.guess();
				return moment.tz( data.date, timezone ).format( data.pattern );
				//return _moment.tz( timezone ).format( data.pattern );
			}catch( ieErr ){
				return moment( data.date ).format( data.pattern );
			}
		}
};