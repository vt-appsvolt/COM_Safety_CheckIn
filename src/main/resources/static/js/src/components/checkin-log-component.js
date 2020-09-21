;(function(app, $){
	var CheckinLog,
	_activeStudentTimer,
	studentOptions =[],
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	FilterTypes= [
		{ name: 'Show All', value: 'All'},
		{ name: 'Morning Checkins', value: 'Morning'},
		{ name: 'Afterschool Checkins', value: 'Afterschool'}
	]
	;
	
	
	function loadCheckinLog( $target, search, _moment, page ){
		setActiveContainer( $target );
		_moment = _moment || moment();
		page = page || getPageObj();
		page.size = 500;
		_checkinLogController.getCheckinLog( search, _moment, page )
		.done( function( checkinLog ){
			console.log(['loadCheckinLog', loadCheckinLog]);
			renderCheckinLogs( $target, formatCheckinLogs( checkinLog, _moment, page ), _moment );
		});
	}
	
	function loadCheckinLogRows( search, _moment, page ){
		_checkinLogController.getCheckinLog( search, _moment, page )
		.done( function( checkinLog ){
			renderCheckinLogRows( formatCheckinLogs( checkinLog, _moment, page ), _moment );
		});
	}
	
	
	function loadStudentCheckinLedgerModal( ajaxData ){
		_checkinController.getStudentCheckinLedger( ajaxData )
		.done( function( checkinPage ){
			console.log(['checkinPage', checkinPage]);
			var json = formatCheckinLedger( checkinPage, ajaxData );
			renderStudentCheckinLedgerModal( ajaxData, json );
			
		});
	}
	
	function reloadStudentCheckinLedgerModal(){
		var ajaxData = $('#student-checkin-log-modal-pagination').pagination('getAjaxData');
		if( typeof ajaxData.startDate !== 'undefined' && ajaxData.startDate !== '' ){
			_startMoment = moment( ajaxData.startDate, 'MM/DD/YYYY');
			ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.endDate !== 'undefined' && ajaxData.endDate !== '' ){
			_endMoment = moment( ajaxData.endDate, 'MM/DD/YYYY');
			ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.familyFilter !== 'undefined' && 'All' !== ajaxData.familyFilter ){
			ajaxData.studentId = parseInt( ajaxData.familyFilter );
		}
		console.log(['reloadStudentCheckinLedgerModal ', ajaxData ]);
		_checkinController.getStudentCheckinLedger( ajaxData )
		.done( function( checkinPage ){
			console.log(['checkinPage', checkinPage]);
			var json = formatCheckinLedger( checkinPage, ajaxData );
			rerenderStudentCheckinLedgerModal( ajaxData, json );
			
		});
	}
	
	function loadStudentCheckinLedgerModalRows( ajaxData ){
		_checkinController.getStudentCheckinLedger(ajaxData)
			.done( function( checkinPage ){
			console.log(['checkinPage', checkinPage]);
			var json = formatCheckinLedger( checkinPage, ajaxData );
			rerenderStudentLedgerModalTotals( json );
			renderCheckinLedgerModalRows( ajaxData, json );
		});
	}
	
	function loadEditManualCheckin( json ){
		if( typeof json !== 'undefined' ){
			json.isEdit = true;
		}else{
			json = {
				isEdit: false,
				students: studentOptions,
				checkinTime: '03:00 pm',
				checkoutTime: '05:00 pm'
			};
		}
		console.log(['loadEditManualCheckin', json]);
		renderEditManualCheckin( json );
		
	}
	
	function rerenderStudentLedgerModalTotals( json ){
		CheckinLog.render('tempLedgerTotals', $('#student-ledger-modal-totals'), json);
	}
	
	function renderCheckinLogRows( checkInLogs, _moment ){
		CheckinLog.render('tempStudentRowWrap', $('#checkin-log-table').find('tbody'), checkInLogs, ['tempStudentRow'])
		.done( function(){
			renderCheckinLogPagination( checkInLogs.page );
			uniqueStudentCheckinCount( _moment );
			bindDeleteCheckinLog();
			bindEditCheckinLog();
		});
	}
	
	function renderCheckinLogs( $target, checkInLogs, _moment ){
		CheckinLog.render('tempCheckinLogTable', $target, checkInLogs, ['tempStudentRow'])
		.done( function(){
			$('.checkin-log-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			renderCheckinLogPagination( checkInLogs.page );
			uniqueStudentCheckinCount( _moment );
			bindDeleteCheckinLog();
			bindEditCheckinLog();
			bindPrintCheckinLog();
			$('#clear-daily-logs')
				.off('click')
				.on('click', function(){
					renderClearDailyLogsModal();
				});
		});
	}
	
	function renderCheckinLog( checkinLog ){
		CheckinLog.getRenderedString('tempStudentRow', checkinLog )
		.done(function( renderedString ){
			$('#checkin-log-row-'+checkinLog.id).replaceWith( renderedString );
			bindDeleteCheckinLog();
			bindEditCheckinLog();
		});
		
	}
	
	function renderEditCheckinLogModal( json ){
		CheckinLog.getRenderedString('tempEditCheckinLogModal', json)
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#editCheckinLogModal').modal('show');
			$('#editCheckinLogModal')
				.find('.time-range').each(function(){
					$(this).inputmask('datetime', {  
						'inputFormat': 'hh:MM TT',
						'outputFormat': 'HH:MM:ss'
					});
			});
			$('#modal-edit-checkin-log-btn')
			.off('click')
			.on('click', function(){
				console.log(['clicked']);
				var $form = $('#editCheckinLogModal').find('form');
				var json = $form.serializeJSON( serializeJSON_Defaults );
				
				console.log(['edit checkout json ', json ]);
				_checkinLogController.updateCheckinLog(json)
				.done( function( checkinLog ){
					renderCheckinLog( formatStudent( checkinLog ) );
					$('#editCheckinLogModal').modal('hide');
				});
			});
		});
		
	}
	
	function renderStudentCheckinLedgerModal( ajaxData, json ){
		CheckinLog.getRenderedString('tempStudentCheckinLogModal', json, ['tempLedgerTableBody', 'tempLedgerTableRow', 'tempLedgerTotals'])
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#checkinLedgerModal').modal('show');
			$('.checkin-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			
			renderCheckinLedgerModalPagination( ajaxData,  json.page );
			bindPrintStudentLedgerModal();
			bindAddManualCheckinLog();
			bindManualEditDeleteCheckinLog();
		});
	}
	
	function rerenderStudentCheckinLedgerModal( ajaxData, json ){
		CheckinLog.getRenderedString('tempStudentCheckinLogModal', json, ['tempLedgerTableBody', 'tempLedgerTableRow', 'tempLedgerTotals'])
		.done( function( renderedString ){
			$('#modal-wrapper').find('.modal-body').html( $(renderedString).find('.modal-body') );
			$('.checkin-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			
			renderCheckinLedgerModalPagination( ajaxData,  json.page );
			bindPrintStudentLedgerModal();
			bindAddManualCheckinLog();
			bindManualEditDeleteCheckinLog();
		});
	}
	
	function renderEditManualCheckin( json ){
		json.fn = _mustacheHelper;
		CheckinLog.render('tempEditManualCheckin', $('.edit-checkin-log-wrap'), json )
		.done( function(){
			//$('#add-transation-btn').hide();
			$('.manual-checkin-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindEditManualCheckinButtons();
			
		});
	}
	
//	function renderActiveStudent( student ){
//		CheckinLog.getRenderedString('tempStudentRow', student )
//		.done( function( renderedString ){
//			$('#active-table').find('tbody').prepend(renderedString);
//			bindCheckoutRows();
//		});
//		
//	}
	function renderCheckinLedgerModalRows( ajaxData, json ){
		CheckinLog.getRenderedString('tempLedgerTableBody', json, ['tempLedgerTableRow'])
		.done( function( renderedString ){
			$('#modal-wrapper').find('tbody').html( renderedString );
			renderCheckinLedgerModalPagination( ajaxData, json.page );
			bindPrintStudentLedgerModal();
			bindAddManualCheckinLog();
			bindManualEditDeleteCheckinLog();
		});
	}
	
	function renderCheckinLedgerModalPagination( _ajaxData, _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#student-checkin-log-modal-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					console.log(['overrideLoadFunction', data.ajaxData]);
					if( typeof data.ajaxData.startDate !== 'undefined' && data.ajaxData.startDate !== '' ){
						_startMoment = moment( data.ajaxData.startDate, 'MM/DD/YYYY');
						data.ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
						//delete data.ajaxData.date;
					}
					if( typeof data.ajaxData.endDate !== 'undefined' && data.ajaxData.endDate !== '' ){
						_endMoment = moment( data.ajaxData.endDate, 'MM/DD/YYYY');
						data.ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
						//delete data.ajaxData.date;
					}
					if( typeof data.ajaxData.transactionType !== 'undefined' && 'All' === data.ajaxData.transactionType ){
						delete data.ajaxData.transactionType;
					}
					if( typeof data.ajaxData.familyFilter !== 'undefined' && 'All' !== data.ajaxData.familyFilter ){
						data.ajaxData.studentId = parseInt( data.ajaxData.familyFilter );
					}
					
					loadStudentCheckinLedgerModalRows( data.ajaxData );
				},
				filterClass: 'student-checkin-log-modal-filter',
				ajaxData: _ajaxData
			});
		});
	}
	
	
	function renderCheckinLogPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#checkin-log-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					//TODO: get this from UI
					console.log(['pagination ', data ]);
					var _moment;
					if( typeof data.ajaxData.date !== 'undefined' ){
						_moment = moment( data.ajaxData.date, 'MM/DD/YYYY');
						delete data.ajaxData.date;
					}else{
						_moment = moment();
					}
					loadCheckinLogRows( data.search, _moment, data.ajaxData );
				}, 
				filterClass: 'checkin-log-filter',
				ajaxData: page
			});
		});
	}
	
	function renderClearDailyLogsModal( ){
		var _moment = moment( $('.checkin-log-date').val(), 'MM/DD/YYYY');
		var json = {
			formattedDate: _moment.format('MM/DD/YYYY')
		};
		CheckinLog.getRenderedString('tempClearCheckinLogModal', json )
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#clearCheckinLogModal').modal('show');
			$('#modal-checkin-clear-btn')
				.off('click')
				.on('click', function(){
					var confirmation = $('#clearCheckinLogModal').find('input.confirmation').val();
					if( confirmation === 'CLEAR' ){
						$('#clearCheckinLogModal').find('input.confirmation').removeClass('is-invalid');
						_checkinLogController.clearCheckinLog( _moment ).done(function(){
							$('#clearCheckinLogModal').modal('hide');
							console.log(['checking log controller loadPage 109']);
							$('#checkin-log-pagination').pagination('loadPage');
						});
					}else{
						$('#clearCheckinLogModal').find('input.confirmation').addClass('is-invalid');
					}
				});
			$('#clearCheckinLogModal').find('input.confirmation')
			.off('keyup')
			.on('keyup', function(){
				var confirmation = $('#clearCheckinLogModal').find('input.confirmation').val();
				if( confirmation === 'CLEAR' ){
					$('#clearCheckinLogModal').find('input.confirmation').removeClass('is-invalid');
				}else{
					$('#clearCheckinLogModal').find('input.confirmation').addClass('is-invalid');
				}
			});
		});
		
	}
	
	
	function formatCheckinLogs( checkinLogPage, _moment, ajaxData ){
		console.log(['formatCheckinLogs', checkinLogPage, _moment, ajaxData ]);
		var checkinLogs = {
			checkIns: checkinLogPage.content,
			page: getPageObj( checkinLogPage ),
			formattedDate: _moment.format('MM/DD/YYYY')
		};
		
		if( typeof checkinLogs.checkIns !== 'undefined' ){
			checkinLogs.checkIns.forEach( function(student){
				formatStudent( student );
			});
		}
		
		checkinLogs.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			checkinLogs.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( checkinLogs.page.size === value ? 'selected' : '')
			});
		});
		
		checkinLogs.studentSortOptions = [];
		$.each( CheckinSorts, function( index, val ){
			checkinLogs.studentSortOptions.push({
				val: val.value,
				name: val.name,
				selected: ( checkinLogs.studentSort === val.value ? 'selected': '' )
			});
		});
		checkinLogs.studentFilterOptions = [];
		$.each( FilterTypes, function( index, val ){
			checkinLogs.studentFilterOptions.push({
				val: val.value,
				name: val.name,
				selected: ( checkinLogs.studentFilter === val.value ? 'selected': '' )
			});
		});
		
		
		if( typeof ajaxData !== 'undefined' && 
			typeof ajaxData.studentFilter !== 'undefined' && 
			ajaxData.studentFilter !== 'All' ){
			$('.active-filter-student-log-count').html( checkinLogPage.totalElements );
			$('.active-filter-student-log-count-wrap').show();
		}else{
			$('.active-filter-student-log-count-wrap').hide();
		}
		
		console.log(['formatCheckinLogs', checkinLogs, CheckinSorts]);
		
		
		
		return checkinLogs;
	}
	
	function bindPrintStudentLedgerModal( ){
		$('#print-student-checkin-ledger')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
//					var _clone = $('#billingLedgerModal').find('.modal-body').clone();
//					var $this = $(this),
//						thisHTML = $.trim($(".dnp",_clone).remove().end().html());
				var $this = $(this);
					$('#checkinLedgerModal').print({
						pathToPrint: 'about:blank'
					});
					
					var thisHTML = $('#checkinLedgerModal').print('filteredHtml', $('#checkinLedgerModal').find('.modal-body'));
					
					$('#printFrame').contents()
						.find('body')
							.html(thisHTML);
					
					setTimeout(function () {						
						$('#checkinLedgerModal').print('printIframe');
					}, 500);
		});
	
}
	
	function bindAddManualCheckinLog(){
		$('#add-checkin-log-btn') 
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
			$('#add-checkin-log-btn').hide();
			loadEditManualCheckin();
			
			
		});
	}
	
	function bindManualEditDeleteCheckinLog(){
		$('.checkin-ledger-edit')
			.off('click')
			.on('click', function( e ){
				e.preventDefault();
				var $elem = $(this);
				_checkinLogController.fetchManualCheckinLog( $(this).data('id') )
				.done(function( json ){
					$('#add-checkin-log-btn').hide();
					loadEditManualCheckin( json );
				});
			});
		$('.checkin-ledger-remove')
			.off('click')
			.on('click', function( e ){
				var logId  = $(this).data('id');
				$('.manual-checkin-ledger-row[data-id='+logId+']').after(
					'<tr class="delete-manual-checkin-row" data-id="'+logId+'" >'+
						'<td colspan="4">Delete Record and Reverse Billed Amounts?</td>'+
						'<td>'+
							'<button class="btn btn-danger btn-cancel-delete-manual-checkin" data-id="'+logId+'" style="margin-right: 15px;">Cancel</button>'+
							'<button class="btn btn-success btn-confirm-delete-manual-checkin" data-id="'+logId+'">Confirm</button>'+
						'</td>'+
					'</tr>'
				);
				$('.btn-cancel-delete-manual-checkin')
					.off('click')
					.on('click', function(){
						var deleteLogId = $(this).data('id');
						$('.delete-manual-checkin-row[data-id='+deleteLogId+']').remove();
						
						
					});
				$('.btn-confirm-delete-manual-checkin')
				.off('click')
				.on('click', function(){
					var deleteLogId = $(this).data('id');
					$('.delete-manual-checkin-row[data-id='+deleteLogId+']').remove();
					_checkinLogController.clearSingleCheckinLog( deleteLogId )
					.done(function(){
						//$elem.closest('tr').remove();
						//uniqueStudentCheckinCount( moment( $('.checkin-log-date').val(), 'MM/DD/YYYY') );
						$(document).trigger('manualCheckinLog');
						reloadStudentCheckinLedgerModal();
					});
					$('.manual-checkin-ledger-row[data-id='+deleteLogId+']').remove();
				});
			});	
	}
	
	function bindEditManualCheckinButtons(){
		$('.checkinRecordType-select')
		.off('change')
		.on('change', function(){
			var recordType = $(this).find('option:selected').val();
			if( recordType === 'Afterschool' ){
				$('#edit-manual-checkin-form').find('.checkinTime').val('03:00 pm');
				$('#edit-manual-checkin-form').find('.checkoutTime').val('05:00 pm');
				
			}else{
				$('#edit-manual-checkin-form').find('.checkinTime').val('07:00 am');
				$('#edit-manual-checkin-form').find('.checkoutTime').val('07:50 am');
			}
		});
		
		$('.checkinDate')
		.off('change')
		.on('change', function(){
			$('#edit-manual-checkin-form').find('.checkoutDate').val( $('#edit-manual-checkin-form').find('.checkinDate').val() );
		});
		
		
		
		$('.cancel-manual-checkin-btn')
			.off('click')
			.on('click', function(){
				$('.edit-checkin-log-wrap').empty();
				$('#add-checkin-log-btn').show();
			});
		$('.save-manual-checkin-btn ')
			.off('click')
			.on('click', function(){
				var $form = $('.edit-checkin-log-wrap').find('form');
				var json = $form.serializeJSON( serializeJSON_Defaults );
				
				if( typeof json.checkinTime !== 'undefined' ){
					json.checkinTime = json.checkinTime.toUpperCase();
				}
				if( typeof json.checkoutTime !== 'undefined' ){
					json.checkoutTime = json.checkoutTime.toUpperCase();
				}
				
				_checkinLogController.postManualCheckinLog( json )
				.always( function(){
					$('.edit-checkin-log-wrap').empty();
					$('#add-checkin-log-btn').show();
					reloadStudentCheckinLedgerModal();
					$(document).trigger('manualCheckinLog');
				});
			});
	}
	
	function bindDeleteCheckinLog(){
		$('.delete-log-btn')
		.off('click')
		.on('click', function(){
			var $elem = $(this);
			_checkinLogController.clearSingleCheckinLog( $(this).data('id') )
			.done(function(){
				$elem.closest('tr').remove();
				uniqueStudentCheckinCount( moment( $('.checkin-log-date').val(), 'MM/DD/YYYY') );
			});
		});
	}
	
	function bindEditCheckinLog(){
		$('.checkin-log-edit').off('click')
		.on('click', function(){
			var $elem = $(this);
			
			var json = {
			  id: $elem.data('id'),
			  defaultCheckInTime: $elem.data('checkin'),
			  defaultCheckOutTime: $elem.data('checkout'),
			  studentName: $elem.closest('tr').find('.student-name').html()
			};
			
			console.log(['renderEditCheckinLogModal', json]);
			renderEditCheckinLogModal( json );
			
//			_checkinLogController.clearSingleCheckinLog( $(this).data('id') )
//			.done(function(){
//				$elem.closest('tr').remove();
//				uniqueStudentCheckinCount( moment( $('.checkin-log-date').val(), 'MM/DD/YYYY') );
//			});
		});
		
	}
	
	function bindPrintCheckinLog(){
		$('#print-students')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-students').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-students').print('filteredHtml', $('#student-checkin-log-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-students').print('printIframe');
				}, 500);
		});
	}
	
	function bindCheckinLedgerModal( clazz ){
		clazz = clazz || 'student-checkin-ledger';
		$('.'+clazz)
			.off('click')
			.on('click', function(){
				loadStudentCheckinLedgerModal( {
					startDate: moment().startOf('month').format('DD.MM.YYYY'),
					endDate:   moment().endOf('month').format('DD.MM.YYYY'),
					studentId: $(this).data('id')
				} );
			});
	}
	
	function formatCheckinLedger( ledgerModel, ajaxData ){
		console.log(['formatCheckinLedger', ledgerModel]);
		var json = {
			allowDelete: Auth.inAuthorizedGroup('OWNERS'),
			allowEdit: Auth.inAuthorizedGroup('OWNERS'),
			checkins: [],
			studentAccounts: [],
			page: {}
		};
		
		studentOptions = [];
		if( typeof ledgerModel.familyAccount !== 'undefined' ){
			json.hasFamilyAccount = true;
			json.familyCheckinCount = ledgerModel.familyAccount.checkinCount;
			json.familyAccountId = ledgerModel.familyAccount.billingBalanceId;
		}
		json.studentAccounts = ledgerModel.studentAccounts;
		if( typeof ledgerModel.studentAccounts !== 'undefined' ){
			$.each( ledgerModel.studentAccounts, function( i, studentAccount  ){
				studentOptions.push({
					studentId: studentAccount.person.id,
					name: studentAccount.person.firstName +' '+studentAccount.person.lastName,
					selected: studentAccount.person.id === ajaxData.studentId ? 'selected':''
				});
			});
		}
		json.studentOptions = studentOptions;
		
		if( typeof ledgerModel.checkinPage !== 'undefined' && ledgerModel.checkinPage.content ){
			json.page = getPageObj( ledgerModel.checkinPage );
			$.each( ledgerModel.checkinPage.content, function( index, checkinLog ){
				json.checkins.push( formatCheckinLedgerLog( checkinLog, json.allowDelete ) );
			});
		}
		json.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			json.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( json.page.size === value ? 'selected' : '')
			});
		});
		if( typeof ajaxData !== 'undefined'){
			if( typeof ajaxData.startDate !== 'undefined' ){
				_startMoment = moment( ajaxData.startDate, 'DD.MM.YYYY');
				json.formattedStartDate = _startMoment.format('MM/DD/YYYY');
			}
			if( typeof ajaxData.endDate !== 'undefined' ){
				_endMoment = moment( ajaxData.endDate, 'DD.MM.YYYY');
				json.formattedEndDate = _endMoment.format('MM/DD/YYYY');
			}
		}
		
		console.log(['formatCheckinLedger after', json]);
		return json;
	}
	
	function formatCheckinLedgerLog( checkinLog, allowDelete){
		if( typeof checkinLog.checkInTime !== 'undefined' ){
			checkinLog.formattedCheckInTime = timeFormatter.formatDate({
				date: checkinLog.checkInTime,
				pattern: 'MM/DD/YY h:mma',
				timezone: 'America/New_York'
			});
		}
		if( typeof checkinLog.checkOutTime !== 'undefined' ){
			checkinLog.formattedCheckOutTime = timeFormatter.formatDate({
				date: checkinLog.checkOutTime,
				pattern: 'MM/DD/YY h:mma',
				timezone: 'America/New_York'
			});
		}
		checkinLog.studentName = '';
		if( typeof checkinLog.student !== 'undefined' ){
			checkinLog.studentName = checkinLog.student.firstName+' '+checkinLog.student.lastName;
		}
		checkinLog.allowDelete = allowDelete;
		checkinLog.pickupName = checkinLog.pickupName || 'Self Checkout';
		return checkinLog;
	}
	
	function formatStudent( student ){
		if( typeof student.checkInTime !== 'undefined' ){
			student.formattedCheckInTime = timeFormatter.formatDate({
				date: student.checkInTime,
				pattern: 'h:mma',
				timezone: 'America/New_York'
			});
		}
		if( typeof student.checkOutTime !== 'undefined' ){
			student.formattedCheckOutTime = timeFormatter.formatDate({
				date: student.checkOutTime,
				pattern: 'h:mma',
				timezone: 'America/New_York'
			});
		}
		return student;
	}
	
	function uniqueStudentCheckinCount( _moment ){
		console.log(['uniqueStudentCheckinCount', _moment]);
		_checkinLogController.fetchUniqueStudentCheckinCount( _moment )
		.done(function( count ){
			$('.unique-student-log-count').html( count );
		});
	}
	
	
	
	
	
	
	var publicFunctions = {
			loadCheckinLog: loadCheckinLog,
			bindCheckinLedgerModal: bindCheckinLedgerModal
		};
		CheckinLog = App.addComponent('CheckinLog', '/students/checkin-log', publicFunctions);
		return CheckinLog;
	})(App, jQuery);