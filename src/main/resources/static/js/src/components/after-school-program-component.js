;(function(app, $){
	var AfterSchoolProgram;
	
	function loadAfterSchoolPrograms( $target ){
		setActiveContainer( $target );
		_afterSchoolProgramController.getAfterSchoolPrograms()
		.done(function( afterSchoolProgramPage ){
			renderAfterSchoolPrograms( $target, formatAfterSchoolProgramsPage( afterSchoolProgramPage ) );
		});
	}
	
	function loadAfterSchoolProgramForm(){
		renderAfterSchoolProgramForm();
	}
	
	function loadActiveEmployeeProgramDropDown(){
		_afterSchoolProgramController.getEmployeeAfterSchoolPrograms()
		.done( function( programs ){
			renderActiveEmployeeProgramDropDown( formatEmployeePrograms( programs ) );
		});
	}
	
	function renderAfterSchoolPrograms( $target, json ){
		AfterSchoolProgram.render('tempAfterSchoolProgramsWrap', $target, json, ['tempAfterSchoolProgram'] )
		.done(function(){
			bindAfterSchoolPrograms();
		});
	}
	
	function renderActiveEmployeeProgramDropDown( programs ){
		AfterSchoolProgram.render('tempEmployeeProgramDropDown', $('#active-program-dropdown'), programs )
		.done(function(){
			bindActiveEmployeeProgramDropDown();
		});
	}
	
	function renderAfterSchoolProgram( afterSchoolProgram ){
		AfterSchoolProgram.getRenderedString('tempAfterSchoolProgram', afterSchoolProgram )
		.done( function( renderedString ){
			$('#after-school-program-wrap').find('ul').append(renderedString);
		});
	}
	
	function renderAfterSchoolProgramForm(){
		AfterSchoolProgram.render('tempAfterSchoolProgramForm', $('#add-after-school-program-wrap'), {} )
		.done(function(){
			bindAfterSchoolProgramForm();
		});	
	}
	
	function formatAfterSchoolProgramsPage( afterSchoolProgramPage ){
		var json = {
			afterSchoolPrograms: afterSchoolProgramPage.content,
			page: getPageObj( afterSchoolProgramPage )	
		};
		return json;
	}
	
	function formatEmployeePrograms( programs ){
		var json = {
			programs: programs	
		};
		
		if(  programs.length > 1 ){
			json.hasMultiple = true;
		}
		
		$.each( programs, function(i,p){
			if( p.isActive ){
				json.activeProgram = p;
				return false;
			}
		});
		
		return json;
	}
	
	function bindAfterSchoolPrograms(){
		$('.add-after-school-program')
		.off('click.AfterSchoolProgram')
		.on('click.AfterSchoolProgram', function(){
			loadAfterSchoolProgramForm();
			$('.add-after-school-program').hide();
		});
	}
	
	function bindAfterSchoolProgramForm(){
		$('#submit-after-school-program')
		.off('click.AfterSchoolProgram')
		.on('click.AfterSchoolProgram', function(){
			var afterSchoolProgram = $('#after-school-program-form').serializeJSON( serializeJSON_Defaults );
			_afterSchoolProgramController.saveAfterSchoolProgram( afterSchoolProgram ).done(function( afterSchoolProgram ){
				renderAfterSchoolProgram( afterSchoolProgram );
				$('#add-after-school-program-wrap').empty();
				$('.add-after-school-program').show();
			});
		});
	}
	
	function bindActiveEmployeeProgramDropDown(){
		$('.active-program:not(.active)')
		.off('click.AfterSchoolProgram')
		.on('click.AfterSchoolProgram', function(){
			_afterSchoolProgramController.setActiveProgramId( $(this).data('id') )
			.done(function( programs ){
				//renderActiveEmployeeProgramDropDown( formatEmployeePrograms( programs ) );
				location.reload();
			});
		});
	}
	
	var publicFunctions = {
		loadAfterSchoolPrograms: loadAfterSchoolPrograms,
		loadActiveEmployeeProgramDropDown: loadActiveEmployeeProgramDropDown
			
	};
	AfterSchoolProgram = App.addComponent('AfterSchoolProgram', '/program/after-school-program', publicFunctions);
	return AfterSchoolProgram;
})(App, jQuery);