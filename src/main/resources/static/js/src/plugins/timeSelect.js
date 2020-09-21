
;(function($){ 
	$.widget('dwf.timeSelect', {
		options: {
			timeClass:'time-range',
			timer: {
				timeFormat: 'h:mm p',
				dynamic: false,
				forceRoundTime: false,
				zindex: 100,
				interval: 15
			},
			range: 15
		},
		_create: function(){
			var self = this;
			self.initializeTimer();
		},
		initializeTimer: function(){
			var self = this;
			var timerParams = self.options.timer;
			if( typeof self.options.minTime !== 'undefined'){
				timerParams.minTime = self.options.minTime;
			}
			if( typeof self.options.maxTime !== 'undefined'){
				timerParams.maxTime = self.options.maxTime;
			}
			$(self.element).timepicker( $.extend( timerParams, {
				defaultTime: $(self.element).data('val') || ''
			}) );
		},
		updateRange: function( time, operation ){
			var self = this;
			var hours = Number(time.match(/^(\d+)/)[1]);
			var minutes = Number(time.match(/:(\d+)/)[1]);
			var AMPM = time.match(/\s(.*)$/)[1];
			if(AMPM === "PM" && hours<12) hours = hours+12;
			if(AMPM === "AM" && hours==12) hours = hours-12;
			if( operation === 'add' ){
				minutes = minutes + self.options.range;
			}else if( operation === 'subtract' ){
				minutes = minutes - self.options.range;
			}
			while( minutes > 60 ){
				hours ++;
				minutes = minutes-60;
			}
			while( minutes < 0 ){
				hours --;
				minutes = minutes+60;
			}
			while( hours > 24 ){
				hours = hours-24;
			}
			while( hours < 0 ){
				hours = hours+24;
			}
			var sHours = hours.toString();
			var sMinutes = minutes.toString();
			if(hours<10) sHours = '0' + sHours;
			if(minutes<10) sMinutes = '0' + sMinutes;
			return 	sHours+':'+sMinutes;
		},
		getHour: function(){
			var time = $(this.element).val();
			var hours = Number(time.match(/^(\d+)/)[1]);
			var AMPM = time.match(/\s(.*)$/)[1];
			if(AMPM === "PM" && hours<12) hours = hours+12;
			if(AMPM === "AM" && hours==12) hours = hours-12;
			return hours;
		},
		getMinutes: function(){
			var time = $(this.element).val();
			var minutes = Number(time.match(/:(\d+)/)[1]);
			return minutes;
		},
		getIsoTime: function(){
			var time = $(this.element).val();
			if( Utils.isEmpty( time ) ){
				return '';
			}
			var hours = Number(time.match(/^(\d+)/)[1]);
			var AMPM = time.match(/\s(.*)$/)[1];
			if(AMPM === "PM" && hours<12) hours = hours+12;
			if(AMPM === "AM" && hours==12) hours = hours-12;
			var minutes = Number(time.match(/:(\d+)/)[1]);
			if(hours<10) 	hours = '0' + hours;
			if(minutes<10)  minutes = '0' + minutes;
			return hours+':'+minutes+':00';
		}
	});
	
})(jQuery);