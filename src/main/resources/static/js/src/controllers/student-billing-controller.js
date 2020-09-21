var _studentBillingController = {
	getStudentBilling: function( personId ){
		return $.getJSON('/student/'+personId);
	},
	getStudents: function( search, page ){
		return $.getJSON('/students', $.extend({
			search: search }, 
			page));
	},
	saveStudent: function( student ){
		return $.ajax('/student.json', { 
			type:'POST',
			data: JSON.stringify( student ),
			dataType: 'json',
			contentType: 'application/json'
		});
	},
	getBillingWeekOptionModels: function(){
		return $.getJSON('/billing/model/weeks');
	},
	getStudentBillingWeekOk: function( _moment, page ){
		return $.getJSON('/student/billing/week/of', $.extend({
			date: _moment.format('DD.MM.YYYY')
		}, page ));
	},
	getStudentBillingWeekOfEntry: function( _moment, studentId ){
		return $.getJSON('/student/billing/week/of/entry', {
			date: _moment.format('DD.MM.YYYY'),
			studentId: studentId
		});
	}
};