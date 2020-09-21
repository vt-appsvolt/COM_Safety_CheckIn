var _checkinController = {
	getActiveStudents: function( search, page ){
		return $.getJSON('/checkin/active/students', $.extend({
			search: search }, 
			page));
	},
	getActiveStudentCounts: function(){
		return $.getJSON('/checkin/active/students/count');
	},
	checkinStudent: function( studentId, override ){
		return $.post('/checkin/student/'+studentId, {override: override || false})
		.done(function( student ){
			$(document).trigger('checkin', [ student ]);
		});
	},
	checkoutStudent: function( studentId ){
		return $.post('/checkout/student/'+studentId)
		.done(function( checkoutResponse ){
			//if( checkoutResponse.studentCheckedOut ){
			if( typeof checkoutResponse.checkinLogs !== 'undefined' ){
				$.each( checkoutResponse.checkinLogs, function( index, student ){
					$(document).trigger('checkout', [ student ]);
				});
			}else{
				console.log(['checkoutResponse', checkoutResponse]);
			}
		});
	},
	deleteActiveCheckin: function( studentId ){
		return $.post('/active/student/'+studentId+'/checkin/delete');
	},
	guardianCheckout: function( json ){
		return $.ajax('/checkout/guardian', {
			type: 'POST',
			data: JSON.stringify( json ),
			dataType: 'json',
			contentType: 'application/json'
		}).done( function( checkoutResponse ){
			if( typeof checkoutResponse.checkinLogs !== 'undefined' ){
				$.each( checkoutResponse.checkinLogs, function( index, student ){
					$(document).trigger('checkout', [ student ]);
				});
			}else{
				console.log(['checkoutResponse', checkoutResponse]);
			}
		});
	},
	getStudentCheckinLedger: function( json ){
		return $.get('/student/checkin/log/ledger', json );
	},
	getAfterschoolProgramCheckinLedger: function( json ){
		return $.get('/program/checkin/log/ledger', json );
	}
};