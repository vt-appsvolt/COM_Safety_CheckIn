var _checkinLogController = {
		getCheckinLog: function( search, _moment, page ){
			return $.getJSON('/checkin/daily/log', $.extend({
				search: search,
				date: _moment.format('DD.MM.YYYY')
			}, page ));
		},
		fetchUniqueStudentCheckinCount: function( _moment ){
			return $.getJSON('/checkin/daily/log/unique/count', { date: _moment.format('DD.MM.YYYY') } );
		},
		clearCheckinLog: function( _moment ){
			return $.post('/checkin/daily/log/clear', {
					date: _moment.format('DD.MM.YYYY')
				});
//			return $.ajax('/checkin/daily/log/clear', {
//				type: 'POST',
//				data: {
//					date: _moment.format('DD.MM.YYYY')
//				},
//				dataType: 'json',
//				contentType: 'application/json'
//			});
		},
		clearSingleCheckinLog: function( id ){
			return $.post('/checkin/daily/log/'+id+'/clear');
		},
		updateCheckinLog: function( json ){
			return $.post('/checkin/daily/log/update', json);
//			return $.ajax('/checkin/daily/log/update', {
//				type: 'POST',
//				data: json,
//				dataType: 'json',
//				contentType: 'application/json'
//			});
		},
		fetchManualCheckinLog: function( id ){
			return $.getJSON('/checkin/manual/log/'+id);
		},
		postManualCheckinLog: function( json ){
			return $.ajax('/checkin/manual/log', {
				type: 'POST',
				data: JSON.stringify( json ),
				dataType: 'json',
				contentType: 'application/json'
			});
			
		}
};