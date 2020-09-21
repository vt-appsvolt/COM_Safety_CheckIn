;(function(app, $){
	var AttendanceSummary,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	StudentFilters = [
		{ name: 'Show All', value:'ALL' },
		{ name: 'Morning', value:'MORNING' },
		{ name: 'Afterschool', value:'AFTERSCHOOL' },
		{ name: 'CCPS', value:'CCPS'}, 
		{ name: 'Scholarship', value:'SCHOLARSHIP'},
		{ name: 'ELC', value:'ELC'},
		{ name: 'Regular Rate', value:'DEFAULT_RATE'}
	];
	
	function loadAttendanceSummary( $target, ajaxData ){
		setActiveContainer( $target );
		ajaxData = ajaxData || {};
		ajaxData.startDate  =  moment().startOf('month').format('DD.MM.YYYY');
		ajaxData.endDate    = moment().endOf('month').format('DD.MM.YYYY');
		
		_checkinController.getAfterschoolProgramCheckinLedger( ajaxData )
		.done( function( attendaceSummary ){
			console.log(['attendaceSummary', attendaceSummary]);
			var json = formatAttendaceSummary( attendaceSummary, ajaxData );
			renderStudentAttendanceSummary( $target, ajaxData, json );
		});
	}
	
	function reloadAttendanceSummary( ajaxData ){
		_checkinController.getAfterschoolProgramCheckinLedger( ajaxData )
		.done( function( attendaceSummary ){
			console.log(['attendaceSummary', attendaceSummary]);
			var json = formatAttendaceSummary( attendaceSummary, ajaxData );
			rerenderStudentAttendanceSummary( ajaxData, json );
			$('#active-filter-row').html( json.activeFilter );
			$('#attendance-summary-range').html(json.attendanceRange);
			
		});
	}
	
	function renderStudentAttendanceSummary( $target, ajaxData, json ){
		AttendanceSummary.render('tempProgramAttendanceSummary', $target, json, ['tempStudentAttendanceTable','tempStudentAttendanceRow'])
		.done( function(){
			$('.checkin-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindPrintAttendanceSummary();
			renderAttendaceSummaryPagination( ajaxData );
		});
	}
	
	function rerenderStudentAttendanceSummary( ajaxData, json ){
		AttendanceSummary.render('tempStudentAttendanceTable', $('#attendance-summary-table'), json, ['tempStudentAttendanceRow'])
		.done( function(){
			renderAttendaceSummaryPagination( ajaxData );
		});
	}
	
	
	function renderAttendaceSummaryPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#attendance-summary-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					page = $.extend( page, data.ajaxData );
					console.log(['overrideLoadFunction', data, page]);
					if( typeof page.startDate !== 'undefined' && page.startDate !== '' ){
						_startMoment = moment( page.startDate, 'MM/DD/YYYY');
						page.startDate = _startMoment.format('DD.MM.YYYY');
					}
					if( typeof page.endDate !== 'undefined' && page.endDate !== '' ){
						_endMoment = moment( page.endDate, 'MM/DD/YYYY');
						page.endDate = _endMoment.format('DD.MM.YYYY');
					}
					reloadAttendanceSummary( page );
				},
				filterClass: 'attendance-summary-checkin-log-filter',
				ajaxData: page
			});
		});
	}
	
	
	function formatAttendaceSummary( attendaceSummary, ajaxData ){
		ajaxData = ajaxData || {};
		var startMoment = moment( ajaxData.startDate, 'DD.MM.YYYY');
		var endMoment   = moment( ajaxData.endDate, 'DD.MM.YYYY');
		
		var json = {
			program: formatAfterSchoolProgram( attendaceSummary.program ),
			headerColumns: formatHeaderColumns( startMoment, endMoment ),
			totalChildrenCount: attendaceSummary.students.length,
			halfDayCount: 0,
			fullDayCount: 0,
			students: [],
			activeFilter: ''
		};
		
		json.attendanceRange = startMoment.format('dddd, MMMM Do YYYY')+' to '+endMoment.format('dddd, MMMM Do YYYY');
		json.formattedStartDate = startMoment.format('MM/DD/YYYY');
		json.formattedEndDate = endMoment.format('MM/DD/YYYY');
		json.filterOptions = [];
		$.each( StudentFilters, function( index, val ){
			json.filterOptions.push({
				val: val.value,
				name: val.name,
				selected: ( ajaxData.filter === val.value ? 'selected': '' )
			});
			if( typeof ajaxData.filter !== 'undefined' && ajaxData.filter !== 'ALL' && ajaxData.filter === val.value ){
				json.activeFilter = val.name;	
			}
		});
		
		
		
		$.each( attendaceSummary.students, function( i , studentModel ){
			json.students.push( formatStudentRow( json, studentModel, startMoment, endMoment ) );
		});
		
		return json;
	}
	
	function formatAfterSchoolProgram( program ){
		var json={};
		if( typeof program.programFullName !== 'undefined' ){
			json.programFullName = program.programFullName;
		}else{
			json.programFullName = program.programName;
		}
		if( typeof program.address !== 'undefined' ){
			json.street = program.address.street;
			json.address = program.address.city+', '+program.address.state+' '+program.address.zipcode;
		}
		if( typeof program.phone !== 'undefined' ){
			json.phone = program.phone.contactValue;
		}
		if( typeof program.email !== 'undefined' ){
			json.email = program.email.contactValue;
		}
		return json;
	}
	
	function formatStudentRow( json, studentModel, startMoment, endMoment ){
		var student = {
			childTitle: formatChildTitle( studentModel ),
			attendanceColumns: [],
			halfDayCount: 0,
			fullDayCount: 0
		};
		
		var attendanceMap = {};
		$.each( studentModel.checkinLogs, function( i , checkinLog ){
			var _checkinMoment = timeFormatter.getMomentFullDate({
				date: checkinLog.checkInTime,
				timezone: 'America/New_York'
			});
			var attendanceMapKey = _checkinMoment.format('DD.MM.YYYY');
			if( typeof attendanceMap[attendanceMapKey] === 'undefined' ){
				attendanceMap[attendanceMapKey] = [];
			}
			attendanceMap[attendanceMapKey].push( checkinLog );
		});
		
		var mom = startMoment.clone();
		var index = 0;
		do{
			var columnKey = mom.format('DD.MM.YYYY');
			if( typeof attendanceMap[columnKey] !== 'undefined' ){
				var attendanceColumn = formatAttendaceColumn( attendanceMap[columnKey] );
				if( attendanceColumn.isFullDay ){
					student.fullDayCount++;
					json.fullDayCount++;
					json.headerColumns[index].total++;
				}
				if( attendanceColumn.isHalfDay ){
					student.halfDayCount ++;
					json.halfDayCount ++;
					json.headerColumns[index].total++;
				}
				student.attendanceColumns.push( attendanceColumn );
			}else{
				student.attendanceColumns.push({ didNotAttend : true });
			}
			mom.add(1, 'd');
			index++;
		}while( mom.isSameOrBefore( endMoment, 'day') );
		return student;
	}
	
	function formatAttendaceColumn( checkinLogs ){
		var hours = 0;
		var json = {};
		if( typeof checkinLogs !== 'undefined' ){
			$.each( checkinLogs, function( i, checkinLog){
				var checkinMoment =  timeFormatter.getMomentFullDate({
					date: checkinLog.checkInTime,
					timezone: 'America/New_York'
				});
				var checkoutMoment =  timeFormatter.getMomentFullDate({
					date: checkinLog.checkOutTime,
					timezone: 'America/New_York'
				});
				hours += checkoutMoment.diff(checkinMoment, 'hours', true);
			});

			if( hours >= 6 ){
				json.isFullDay = true;
			}else{
				json.isHalfDay = true;
			}	
		}else{
			json.didNotAttend = true;
		}
		return json;
	}
	
	function formatChildTitle( studentModel ){
		console.log(['studentModel', studentModel]);
		var title = studentModel.student.lastName+', '+studentModel.student.firstName;
		if( typeof studentModel.student.school !== 'undefined' ){
			title += ' ('+studentModel.student.school.name+')';
		}
		return title;
	}
	
	function formatAttendanceColumns( studentModel, startMoment, endMoment ){
		var mom = startMoment.clone();
		var json = [];
		do{
			json.push({
				title: mom.format('DD'),
				total: 0
			});
			mom.add(1, 'd');
		}while( mom.isSameOrBefore( endMoment, 'day') );
		return json;
	}
	
	function formatHeaderColumns( startMoment, endMoment ){
		var mom = startMoment.clone();
		var json = [];
		do{
			json.push({
				title: mom.format('DD'),
				total: 0
			});
			mom.add(1, 'd');
		}while( mom.isSameOrBefore( endMoment, 'day') );
		return json;
	}
	
	
	
	function bindPrintAttendanceSummary(){
		$('#print-students')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-students').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-students').print('filteredHtml', $('#attendance-summary-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-students').print('printIframe');
				}, 500);
		});
		
	}
	
	var publicFunctions = {
		loadAttendanceSummary: loadAttendanceSummary	
	};
	AttendanceSummary = App.addComponent('AttendanceSummary', '/students/attendance-summary', publicFunctions);
	return AttendanceSummary;
})(App, jQuery);