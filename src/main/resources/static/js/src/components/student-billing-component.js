;(function(app, $){
	var StudentBilling,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	];
	
	function loadStudentBilling( $target ){
		setActiveContainer( $target );
		console.log(['loadStudentBilling']);
		_studentBillingController.getBillingWeekOptionModels()
		.done(function(weekOptions){
			console.log(['weekOptions', weekOptions]);
			var json = {
				page: getPageObj({})
			};
			json.weeklyOptions = formatWeekOptions(weekOptions);
			json.studentSortOptions = [];
			$.each( CheckinSorts, function( index, val ){
				json.studentSortOptions.push({
					val: val.value,
					name: val.name
					//selected: ( json.studentSort === val.value ? 'selected': '' )
				});
			});
			
			formatPageSizeOptions( json );
			
			var _moment = moment( weekOptions[0], 'MM/DD/YYYY');
			_studentBillingController.getStudentBillingWeekOk( _moment, json.page )
			.done(function( billingLogPage ){
				console.log(['billingLogPage', billingLogPage]);
				json.studentBillings = formatStudentBillings( billingLogPage.content );
				json.page = getPageObj( billingLogPage );
				StudentBilling.render('tempBilling', $target, json, ['tempStudentBillingPage', 'tempStudentBillingRow'] )
				.done( function(){
					bindEditBilling( _moment );
					bindViewBillingLedger();
					bindViewCheckinLedger();
					bindPrintBillingLedger();
					renderStudentBillingPagination( json.page );
				});
			});
		});
	}
	
	function loadStudentBillingRows( _moment, page ){
		var json = {
			page: page
		};
		_studentBillingController.getStudentBillingWeekOk( _moment, page )
		.done(function( billingLogPage ){
			console.log(['billingLogPage', billingLogPage]);
			json.studentBillings = formatStudentBillings( billingLogPage.content );
			json.page = getPageObj( billingLogPage );
			StudentBilling.render('tempStudentBillingPage', $('#student-billing-table').find('tbody'), json, ['tempStudentBillingRow'] )
			.done( function(){
				bindEditBilling( _moment );
				bindViewBillingLedger();
				bindViewCheckinLedger();
				bindPrintBillingLedger();
				renderStudentBillingPagination( json.page );
			});
		});
	}
	
	function renderStudentBillingPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#students-billing-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					console.log(['page data', data]);
					var _moment = moment( data.ajaxData.weekOf, 'MM/DD/YYYY');
					loadStudentBillingRows( _moment, data.ajaxData );
				},
				filterClass: 'student-billing-filter',
				ajaxData: page
			});
		});
	}
	
	function formatStudentBillings( logs ){
		$.each( logs, function( i, v ){
			v = formatStudentBilling(v);
		});
		console.log(['formatStudentBillings', logs]);
		return logs;
	}
	
	function formatStudentBilling( studentBilling ){
		if( typeof studentBilling.dailyRecords !== 'undefined' ){
			$.each( studentBilling.dailyRecords, function(i, dailyRecord){
				formatStudentAttendanceDay( studentBilling, dailyRecord );
			});
		}
		
		switch( studentBilling.paymentStatus ){
			case 'DUE':
				studentBilling.formattedPaymentStatus = 'Due';
				break;
			case 'OUTSTANDING':
				studentBilling.formattedPaymentStatus = 'Outstanding';
				break;
			case 'PAID':
				studentBilling.formattedPaymentStatus = 'Paid';
				break;
		}
		console.log(['formatStudentBilling', studentBilling]);
		return studentBilling;
	}
	
	function formatStudentAttendanceDay( json, dailyRecord ){
		var _moment = moment( dailyRecord.attendanceDate, 'YYYY-MM-DD');
		switch( _moment.day() ){
			case 0: //Sunday
				json.isSundayAttendace = true;
				json.sundayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 1:
				json.isMondayAttendace = true;
				json.mondayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 2:
				json.isTuesdayAttendace = true;
				json.tuesdayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 3:
				json.isWednesdayAttendace = true;
				json.wednesdayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 4:
				json.isThursdayAttendace = true;
				json.thursdayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 5:
				json.isFridayAttendace = true;
				json.fridayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 6:
				json.isSaturdayAttendace = true;
				json.saturdayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
		}
		console.log(['formatStudentAttendanceDay', json]);
	}
	
	function formatAttendanceType( attendanceType ){
		switch( attendanceType ){
			case 'EARLY_RELEASE':
				return 'E';
			case 'ABSENT':
				return 'A';
			case 'FULL_DAY':
				return 'F';
			case 'HALF_DAY':
				return 'H';
			case 'DAILY_RATE':
				return 'D';
		}
	}
	
	
	function formatWeekOptions( weekOptions ){
		var options =[];
		$.each( weekOptions, function(i,v){
			options.push({
				val: v,
				name: v,
				selected: ( i === 0 ? 'selected' : '')
			});
		});
		return options;
	}
	
	function formatPageSizeOptions( json ){
		json.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			json.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( json.page.size === value ? 'selected' : '')
			});
		});
	}
	
	function bindEditBilling( _moment ){
		$('.user-billing-edit')
		.off('click')
		.on('click', function(){
			renderBillingModal( $(this).data('id'), _moment );
		});
	}
	
	function bindViewBillingLedger(){
		app.getComponent('StudentLedger').getFn('bindStudentLedgerModal');
		$(document)
			.off('manualCheckinLog.studentBilling')
			.on('manualCheckinLog.studentBilling', function(){
				var ajaxData = $('#students-billing-pagination').pagination('getAjaxData');
				var _moment = moment( ajaxData.weekOf, 'MM/DD/YYYY');
				loadStudentBillingRows( _moment, ajaxData );
			});
	}
	function bindViewCheckinLedger(){
		app.getComponent('CheckinLog').getFn('bindCheckinLedgerModal');
	}
	
	function bindPrintBillingLedger(){
		$('#print-student-billing')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-student-billing').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-student-billing').print('filteredHtml', $('#student-billing-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-student-billing').print('printIframe');
				}, 500);
		});
	}
	
	function renderBillingModal( studentId, _moment ){
		console.log(['renderBillingModal', studentId, _moment ]);
		StudentBilling.getRenderedString('tempBillingRecordModal', {
			studentId: studentId
		})
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#billingRecordModal').modal('show');
			
			$('#save-billing-btn')
			.off('click')
			.on('click', function(){
				console.log(['clicked']);
				var $form = $('#billingRecordModal').find('form');
				var json = $form.serializeJSON( serializeJSON_Defaults );
				
				if( typeof json.type === 'undefined' ){
					json.type = 'Payment';
				}
				
				_billingController.saveBillingRecord( json )
				.always( function(){
					$('#billingRecordModal').modal('hide');
					_studentBillingController.getStudentBillingWeekOfEntry( _moment, studentId )
					.done(function( billingLog ){
						console.log(['billingLog', billingLog]);
						var responseJSON = {};
						responseJSON = formatStudentBilling( billingLog );
						StudentBilling.getRenderedString('tempStudentBillingRow', responseJSON )
						.done( function( renderedString ){
							console.log(['renderedString', renderedString]);
							$('tr.student-billing-row[data-id='+studentId+']').replaceWith( renderedString );
							bindEditBilling( _moment );
							bindViewBillingLedger();
							bindViewCheckinLedger();
						});
					});
				});
			});
			
			
		});
		
	}
	
	var publicFunctions = {
		loadStudentBilling: loadStudentBilling
	};
	StudentBilling = App.addComponent('StudentBilling', '/billing/student-billing', publicFunctions);
	return StudentBilling;
})(App, jQuery);