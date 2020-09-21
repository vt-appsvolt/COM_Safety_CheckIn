var _studentController = {
	getStudent: function( personId ){
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
	deleteStudent: function( personId ){
		return $.ajax('/delete/student/'+personId,{
			type: 'DELETE'
		});
	}
};