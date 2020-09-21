;(function(app, $){
	var EmployeeTimeclock;
	
	function loadEmployeeTimeclock( $target ){
		setActiveContainer( $target );
		EmployeeTimeclock.render('tempEmployeeTimeclock', $target, {} )
		.done( function(){
			
		});
	}
	
	var publicFunctions = {
		loadEmployeeTimeclock: loadEmployeeTimeclock
	};
	EmployeeTimeclock = App.addComponent('EmployeeTimeclock', '/employee/employee-timeclock', publicFunctions);
	return EmployeeTimeclock;
})(App, jQuery);