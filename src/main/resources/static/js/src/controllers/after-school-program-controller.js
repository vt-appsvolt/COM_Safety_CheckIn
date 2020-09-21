var _afterSchoolProgramController = {
	getAfterSchoolPrograms: function( page ){
		return $.get('/afterschoolprograms.json', page);
	},
	saveAfterSchoolProgram: function( afterSchoolProgram ){
		return $.ajax('/afterschoolprogram.json', {
			type: 'POST',
			data: JSON.stringify( afterSchoolProgram ),
			dataType: 'json',
			contentType: 'application/json'
		});
	},
	getEmployeeAfterSchoolPrograms: function(){
		return $.getJSON('/employee/afterschoolprograms');
	},
	setActiveProgramId: function( activeProgramId ){
		return $.ajax('/employee/afterschoolprogram/'+activeProgramId+'/activate', {
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json'
		});
	}
};